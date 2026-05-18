package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"
)

// ── file storage ─────────────────────────────────────────────────────────────

var (
	dataFile string
	fileMu   sync.RWMutex
)

func rawLogHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		fileMu.RLock()
		raw, err := os.ReadFile(dataFile)
		fileMu.RUnlock()
		if err != nil {
			if os.IsNotExist(err) {
				json.NewEncoder(w).Encode([]interface{}{})
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "read failed"})
			return
		}
		// Frontend expects an array; it takes rawData[0]
		w.Write([]byte("["))
		w.Write(raw)
		w.Write([]byte("]"))

	case http.MethodPost:
		var body interface{}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "invalid JSON"})
			return
		}
		encoded, err := json.Marshal(body)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "encode failed"})
			return
		}
		// Atomic write: temp file → rename
		tmp := dataFile + ".tmp"
		fileMu.Lock()
		err = os.WriteFile(tmp, encoded, 0644)
		if err == nil {
			err = os.Rename(tmp, dataFile)
		}
		fileMu.Unlock()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "save failed"})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// ── LeetCode friend tracker ───────────────────────────────────────────────────

var friendUsernames = []string{
	"Yadi12",
	"ramuk13476",
	"PranjaliJaiswal",
	"aditishukla_16",
	"jeetupal31",
}

type FriendResult struct {
	Username    string `json:"username"`
	SolvedToday int    `json:"solved_today"`
	Error       string `json:"error,omitempty"`
}

// getResetTimestamp returns the Unix timestamp of the most recent 5:30 AM IST.
// 5:30 AM IST = 00:00 UTC, so the reset is always at midnight UTC.
func getResetTimestamp() int64 {
	now := time.Now().UTC()
	midnight := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	return midnight.Unix()
}

func fetchOneFriend(username string, resetTs int64) FriendResult {
	url := fmt.Sprintf(
		"https://leetcode-api-pied.vercel.app/user/%s/submissions?limit=20",
		username,
	)
	client := &http.Client{Timeout: 12 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return FriendResult{Username: username, Error: "fetch failed"}
	}
	defer resp.Body.Close()

	// API returns a JSON array directly: [{...}, {...}, ...]
	var submissions []interface{}
	if err := json.NewDecoder(resp.Body).Decode(&submissions); err != nil {
		return FriendResult{Username: username, Error: "parse failed"}
	}

	seen := make(map[string]bool)
	count := 0

	for _, s := range submissions {
		sub, ok := s.(map[string]interface{})
		if !ok {
			continue
		}

		// Only count accepted submissions
		status, _ := sub["statusDisplay"].(string)
		if status != "Accepted" {
			continue
		}

		// Parse timestamp (can arrive as float64 or string)
		var ts int64
		switch v := sub["timestamp"].(type) {
		case float64:
			ts = int64(v)
		case string:
			ts, _ = strconv.ParseInt(v, 10, 64)
		}
		if ts < resetTs {
			continue
		}

		// Deduplicate by problem slug (fall back to title)
		key, _ := sub["titleSlug"].(string)
		if key == "" {
			key, _ = sub["title"].(string)
		}
		if !seen[key] {
			seen[key] = true
			count++
		}
	}

	return FriendResult{Username: username, SolvedToday: count}
}

func leetcodeFriendsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	resetTs := getResetTimestamp()
	results := make([]FriendResult, len(friendUsernames))
	var wg sync.WaitGroup

	for i, username := range friendUsernames {
		wg.Add(1)
		go func(idx int, uname string) {
			defer wg.Done()
			results[idx] = fetchOneFriend(uname, resetTs)
		}(i, username)
	}
	wg.Wait()

	ist := time.FixedZone("IST", 5*60*60+30*60)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"friends":    results,
		"reset_time": time.Unix(resetTs, 0).In(ist).Format("2 Jan 2006, 3:04 PM IST"),
		"fetched_at": time.Now().In(ist).Format("3:04 PM IST"),
	})
}

// ── CORS middleware ───────────────────────────────────────────────────────────

func cors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

// ── main ──────────────────────────────────────────────────────────────────────

func main() {
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "."
	}
	dataFile = filepath.Join(dataDir, "data.json")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Fatal("Cannot create data directory:", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/raw-log", cors(rawLogHandler))
	mux.HandleFunc("/api/leetcode/friends", cors(leetcodeFriendsHandler))
	mux.HandleFunc("/health", cors(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}))

	log.Printf("LifeTracker backend listening on :%s — data file: %s", port, dataFile)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int m = sc.nextInt();

        Map<String, Set<String>> graph = new HashMap<>();

        // Build graph
        for(int i = 0; i < m; i++) {
            String a = sc.next();
            String b = sc.next();

            graph.putIfAbsent(a, new HashSet<>());
            graph.putIfAbsent(b, new HashSet<>());

            graph.get(a).add(b);
            graph.get(b).add(a);
        }

        System.out.println(graph.size());

        // Process each user
        for(String user : graph.keySet()) {

            Map<String, Integer> count = new HashMap<>();

            // Step 1: iterate friends
            for(String friend : graph.get(user)) {

                // Step 2: iterate friends of friend
                for(String fof : graph.get(friend)) {

                    if(fof.equals(user)) continue;
                    if(graph.get(user).contains(fof)) continue;

                    count.put(fof, count.getOrDefault(fof, 0) + 1);
                }
            }

            // Find max mutual count
            int max = 0;
            for(int val : count.values()) {
                max = Math.max(max, val);
            }

            int ans = 0;

            // Count how many achieve max
            for(int val : count.values()) {
                if(val == max) ans++;
            }

            System.out.println(user + " " + ans);
        }
    }
}
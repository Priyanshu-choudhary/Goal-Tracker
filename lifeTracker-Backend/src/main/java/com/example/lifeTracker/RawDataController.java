package com.example.lifeTracker;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows your React frontend to connect
public class RawDataController {

    @Autowired
    private MongoTemplate mongoTemplate;

    private final String COLLECTION_NAME = "user_activity";

    /**
     * POST: Saves any JSON object directly to MongoDB.
     */
    @PostMapping("/raw-log")
    public Map<String, Object> saveRaw(@RequestBody Map<String, Object> body) {
        Document doc = new Document(body);
        Document saved = mongoTemplate.insert(doc, COLLECTION_NAME);
        return saved;
    }

    /**
     * GET: Retrieves all documents from the collection.
     */
    @GetMapping("/raw-log")
    public List<Document> getAllRaw() {
        return mongoTemplate.findAll(Document.class, COLLECTION_NAME);
    }
}

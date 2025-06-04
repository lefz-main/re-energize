package main

import (
	"encoding/json"
	"net/http"
	"sync"
)

type KeyValueStore struct {
	data map[string]string
	mu   sync.RWMutex
}

var store = KeyValueStore{
	data: make(map[string]string),
}

func sendHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil || input.Key == "" {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	store.data[input.Key] = input.Value
	store.mu.Unlock()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func getHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "Key is required", http.StatusBadRequest)
		return
	}

	store.mu.RLock()
	value, exists := store.data[key]
	store.mu.RUnlock()

	if !exists {
		http.Error(w, "Key not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"key": key, "value": value})
}

func deleteHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "Key is required", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	delete(store.data, key)
	store.mu.Unlock()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func main() {
	http.HandleFunc("/send", sendHandler)
	http.HandleFunc("/get", getHandler)
	http.HandleFunc("/delete", deleteHandler)

	http.ListenAndServe(":8089", nil)
}
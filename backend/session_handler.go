package main

type SessionStore interface {
	Get(key string) string
	Set(key, value string)
}

type SessionStoreInitializer interface {
	New() SessionStore
}



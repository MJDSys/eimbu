package main

type SessionStorage interface {
	Get(key string) string
	Set(key, value string)
}

type SessionStorageInitializer interface {
	New() SessionStorage
}

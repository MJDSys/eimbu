package main

import (
	"github.com/gorilla/securecookie"
)

type SessionStorage interface {
	Get(key string) string
	Set(key, value string)
}

type SessionStorageInitializer interface {
	New(key string) SessionStorage
	Retreive(key string) SessionStorage
}

type SessionsStore interface {
	NewSessionIdentifier() string
	VerifySessionIdentifier(key string) bool

	GetSessionStorageFor(key string) SessionStorage
}

type RealSessionStore struct {
	keys               *securecookie.SecureCookie
	storageInitializer SessionStorageInitializer
}

const SessionName = "Session"

func NewSessionStore(signKey, encryptKey []byte, storageInitializer SessionStorageInitializer) SessionsStore {
	return RealSessionStore{
		keys:               securecookie.New(signKey, encryptKey),
		storageInitializer: storageInitializer,
	}
}

func (r RealSessionStore) NewSessionIdentifier() string {
	actualId := securecookie.GenerateRandomKey(128 / 8)
	if id, err := r.keys.Encode(SessionName, actualId); err != nil {
		panic(err)
	} else {
		return id
	}
	return ""
}

func (r RealSessionStore) VerifySessionIdentifier(key string) bool {
	var id []byte
	err := r.keys.Decode(SessionName, key, &id)

	if err == nil {
		return true
	}
	return false
}

func (r RealSessionStore) GetSessionStorageFor(key string) SessionStorage {
	return r.storageInitializer.New(key)
}

package main

import (
	"encoding/base64"

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
	RefreshSessionIdentifier(key string) string
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

func (r RealSessionStore) RefreshSessionIdentifier(oldId string) string {
	var actualId []byte
	if err := r.keys.Decode(SessionName, oldId, &actualId); err != nil {
		panic(err)
	}

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
	var id []byte
	err := r.keys.Decode(SessionName, key, &id)

	if err == nil {
		return r.storageInitializer.Retreive(base64.StdEncoding.EncodeToString(id))
	}
	return nil
}

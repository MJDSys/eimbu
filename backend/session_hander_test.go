package main

import (
	"github.com/gorilla/securecookie"

	"testing"
)

func TestCreatingNewSessionIdentifier(t *testing.T) {
	signKey, encryptKey := []byte("12345678"), []byte("12345678123456781234567812345678") //Test keys.  Do not use in production!
	SessionsStoreInst := NewSessionStore(signKey, encryptKey, MemorySessionInitializer{})

	sessionId := SessionsStoreInst.NewSessionIdentifier()
	if sessionId == "" {
		t.Error("Empty string returned for the identifier!")
	}
	if !SessionsStoreInst.VerifySessionIdentifier(sessionId) {
		t.Error("Failed to verify own key")
	}

	//As extra pre-caution, make sure an actual cookie is created.
	var out []byte
	if err := (securecookie.New(signKey, encryptKey).Decode(sessionId, "Session", out)); err == nil {
		t.Error("Failed to create a valid secure cookie for id purposes")
	}
}

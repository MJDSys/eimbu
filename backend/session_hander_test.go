package main

import (
	"github.com/gorilla/securecookie"

	"testing"
	"testing/quick"
)

var signKey, encryptKey = []byte("87654321876543218765432187654321"), []byte("12345678123456781234567812345678") //Test keys.  Do not use in production!

func TestCreatingNewSessionIdentifier(t *testing.T) {
	SessionsStoreInst := NewSessionStore(signKey, encryptKey, NewMemorySessionInitializer())

	sessionId := SessionsStoreInst.NewSessionIdentifier()
	if sessionId == "" {
		t.Error("Empty string returned for the identifier!")
	}
	if !SessionsStoreInst.VerifySessionIdentifier(sessionId) {
		t.Error("Failed to verify own key")
	}

	//As extra pre-caution, make sure an actual cookie is created.
	var out []byte
	if err := (securecookie.New(signKey, encryptKey).Decode("Session", sessionId, &out)); err != nil {
		t.Error("Failed to create a valid secure cookie for id purposes (", err, ")")
	}
}

func TestCreatingAndRetreivingSession(t *testing.T) {
	SessionsStoreInst := NewSessionStore(signKey, encryptKey, NewMemorySessionInitializer())
	sessionId := SessionsStoreInst.NewSessionIdentifier()

	storage := SessionsStoreInst.GetSessionStorageFor(sessionId)

	f := func(x string) bool {
		return storage.Get(x) == ""
	}
	if err := quick.Check(f, nil); err != nil {
		t.Error(err)
	}
}

package main

import (
	"testing"
	"testing/quick"
)

func TestMemorySessionInitializerNewSession(t *testing.T) {
	var session SessionStorage = NewMemorySessionInitializer().New("TestSession")
	if session == nil {
		t.Error("Initializer returned a null session!")
	}
	if _, ok := session.(*MemorySession); !ok {
		t.Error("Initializer didn't return a Memory Session!")
	}
}

func TestMemorySessionWithFuzzer(t *testing.T) {
	var session SessionStorage = NewMemorySessionInitializer().New("")

	type KeyValue struct {
		Key, Value string
	}

	f := func(x KeyValue) bool {
		session.Set(x.Key, x.Value)
		return session.Get(x.Key) == x.Value
	}
	if err := quick.Check(f, nil); err != nil {
		t.Error(err)
	}
}

func TestMemorySessionRetreivalReturnsOldSession(t *testing.T) {
	sessionInit := NewMemorySessionInitializer()

	sessionName, keyName, value := "MySession", "MyKey", "MyValue"

	session1 := sessionInit.New(sessionName)
	session1.Set(keyName, value)
	if session1.Get(keyName) != value {
		t.Error("Failed to retreive same value from same session!")
	}

	session2 := sessionInit.Retreive(sessionName)
	if session2.Get(keyName) != value {
		t.Error("Failed to retreive same value from second retreived session!")
	}
}

func TestMemorySessionNewErasesOldSession(t *testing.T) {
	sessionInit := NewMemorySessionInitializer()

	sessionName, keyName, value := "MySession", "MyKey", "MyValue"

	session1 := sessionInit.New(sessionName)
	session1.Set(keyName, value)
	if session1.Get(keyName) != value {
		t.Error("Failed to retreive same value from same session!")
	}

	session2 := sessionInit.New(sessionName)
	if session2.Get(keyName) != "" {
		t.Error("New Sessioon had old session data")
	}
}

func TestMemorySessiionRetreiveNonExistantSession(t *testing.T) {
	sessionInit := NewMemorySessionInitializer()

	sessionName, keyName, value := "MySession", "MyKey", "MyValue"

	session1 := sessionInit.Retreive(sessionName)
	if session1 == nil {
		t.Fatal("Invalid session returned from retreive")
	}
	session1.Set(keyName, value)
	if session1.Get(keyName) != value {
		t.Error("Failed to retreive same value from session!")
	}

	session2 := sessionInit.Retreive(sessionName)
	if session2.Get(keyName) != value {
		t.Error("Failed to retreive same value from second retreived session!")
	}
}

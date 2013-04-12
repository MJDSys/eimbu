package main

import (
	"testing"
	"testing/quick"
)

func TestMemmorySessionInitializer(t *testing.T) {
	var session SessionStore = (MemorySessionInitializer{}).New()
	if session == nil {
		t.Error("Initializer returned a null session!");
	}
	if _, ok := session.(*MemorySession); !ok {
		t.Error("Initializer didn't return a Memory Session!")
	}
}

func TestMemmorySessionWithFuzzer(t *testing.T) {
	var session SessionStore = (MemorySessionInitializer{}).New()

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

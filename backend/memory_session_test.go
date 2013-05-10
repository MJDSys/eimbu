/*
 Copyright (C) 2013 Matthew Dawson (matthew@mjdsystems.ca)
 Copyright (C) 2013 Nathan Jervis (mirhagk@gmail.com)

 Eimbu is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 Eimbu is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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

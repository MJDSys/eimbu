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
	keyName, value := "MyKey", "MyValue"

	storage.Set(keyName, value)
	if storage.Get(keyName) != value {
		t.Error("Failed to retreive same value from same session!")
	}

	session2 := SessionsStoreInst.GetSessionStorageFor(sessionId)
	if session2.Get(keyName) != value {
		t.Error("Failed to retreive same value from second retreived session!")
	}

	sessionId = SessionsStoreInst.RefreshSessionIdentifier(sessionId)

	session3 := SessionsStoreInst.GetSessionStorageFor(sessionId)
	if session3.Get(keyName) != value {
		t.Error("Failed to retreive same value from third retreived session with refreshed key!")
	}
}

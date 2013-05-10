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

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

type MemorySessionInitializer struct {
	sessions map[string]SessionStorage
}

func NewMemorySessionInitializer() SessionStorageInitializer {
	return &MemorySessionInitializer{sessions: make(map[string]SessionStorage)}
}

func (initializer *MemorySessionInitializer) New(key string) (session SessionStorage) {
	session = &MemorySession{data: make(map[string]string)}

	initializer.sessions[key] = session

	return
}

func (initializer *MemorySessionInitializer) Retreive(key string) SessionStorage {
	session, ok := initializer.sessions[key]
	if !ok {
		return initializer.New(key)
	}
	return session
}

type MemorySession struct {
	data map[string]string
}

func (m *MemorySession) Get(key string) string {
	return m.data[key]
}
func (m *MemorySession) Set(key, value string) {
	m.data[key] = value
}

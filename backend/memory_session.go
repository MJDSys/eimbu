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

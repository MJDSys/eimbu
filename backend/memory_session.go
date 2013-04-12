package main

type MemorySessionInitializer struct{}

func (MemorySessionInitializer) New() SessionStore {
	return &MemorySession{data: make(map[string]string)}
}

type MemorySession struct {
	data map[string]string
}

func (m *MemorySession) Get(key string) string {
	return m.data[key]
}
func (m *MemorySession) Set(key, value string) {
	m.data[key] = value;
}

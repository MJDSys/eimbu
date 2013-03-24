package main

import (
	"errors"
	"net/http"

	"strings"
)

type HttpHandlerPrefixStripper struct {
	PassThrough http.Handler
	prefix      string
}

func (h HttpHandlerPrefixStripper) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//Remove the prefix from the URL.  Makes the whole system ignore it.
	r.URL.Path = strings.Replace(r.URL.Path, *prefix, "", 1)

	//And actually handle the request.
	h.PassThrough.ServeHTTP(w, r)
}

type RestHandlerList interface {
	List() interface{}
}

type RestHandlerGet interface {
	Get(id string) interface{}
}

type RestHandlerInsert interface {
	Insert(data interface{}) interface{}
}

type RestHandlerPatch interface {
	Patch(id string, data interface{}) interface{}
}

type RestHandlerDelete interface {
	Delete(id string)
}

type HttpHandlerRestHandler struct {
	Handler interface{}
}

func (h HttpHandlerRestHandler) serveHTTP(w http.ResponseWriter, r *http.Request, matches map[string]string) interface{} {
	switch r.Method {
	case "GET":
		if id, ok := matches["id"]; ok == true {
			return h.Handler.(RestHandlerGet).Get(id)
		} else {
			return h.Handler.(RestHandlerList).List()
		}
		break
	default:
		panic(errors.New("No method found!"))
	}
	panic(errors.New("Unreachable!"))
}

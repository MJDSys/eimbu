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

func (h HttpHandlerRestHandler) serveHTTP(w http.ResponseWriter, r *http.Request, matches map[string]string) {
	switch r.Method {
	case "GET":
		if id, ok := matches["id"]; ok == true {
			h.Handler.(RestHandlerGet).Get(id)
		} else {
			h.Handler.(RestHandlerList).List()
		}
		break
	default:
		panic(errors.New("No method found!"))
	}
	panic(errors.New("Unreachable!"))
}

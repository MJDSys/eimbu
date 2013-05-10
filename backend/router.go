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
	"fmt"

	"net/http"

	"regexp"

	"strings"
)

type MatchedHttpHandler interface {
	serveHTTP(w http.ResponseWriter, r *http.Request, matches map[string]string)
}

type regexPath struct {
	regexp  *regexp.Regexp
	matches []string
	handler MatchedHttpHandler
}

type HttpHandlerRegexMatcher struct {
	paths []regexPath
}

var regexHandler = NewHttpHandlerRegexMatcher()

func NewHttpHandlerRegexMatcher() *HttpHandlerRegexMatcher {
	return &HttpHandlerRegexMatcher{}
}

//Note this function needs a regexp clean string.  Things like [()], etc will mess it up!
func (h *HttpHandlerRegexMatcher) Handle(path string, handler MatchedHttpHandler) {
	elements := strings.Split(path, "/")
	var new_elements []string
	var matches []string
	i := 0

	for _, str := range elements {
		if str == "" {
			continue
		} else {
			if str[0:1] == "{" && str[len(str)-1:len(str)] == "}" {
				matches = append(matches, str[1:len(str)-1])
				fmt.Printf("%v\n", matches)
				str = "([[:alnum:]_]*?)"
			}
			new_elements = append(new_elements, str)
			i++
		}
	}
	path_regexp := "^/" + strings.Join(new_elements[0:i], "/")
	if path[len(path)-1:len(path)] == "/" {
		path_regexp += "/"
	}
	path_regexp += "$"
	fmt.Printf("%v\n", path_regexp)
	h.paths = append(h.paths, regexPath{regexp.MustCompile(path_regexp), matches, handler})
}

type RegularHandlar func(w http.ResponseWriter, r *http.Request, matches map[string]string)

func (h RegularHandlar) serveHTTP(w http.ResponseWriter, r *http.Request, matches map[string]string) {
	h(w, r, matches)
}

func (h *HttpHandlerRegexMatcher) HandleFunc(path string, handler RegularHandlar) {
	h.Handle(path, RegularHandlar(handler))
}

func (h *HttpHandlerRegexMatcher) HandleRegularHandler(path string, handler http.Handler) {
	h.HandleFunc(path, func(w http.ResponseWriter, r *http.Request, matches map[string]string) {
		handler.ServeHTTP(w, r)
	})
}

func (h *HttpHandlerRegexMatcher) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	found := false
	fmt.Printf("%v\n", r.URL.Path)
	for _, matcher := range h.paths {
		if matches := matcher.regexp.FindStringSubmatch(r.URL.Path); matches != nil {
			found = true

			details := make(map[string]string)
			for index, match := range matches[1:len(matches)] {
				details[matcher.matches[index]] = match
			}
			fmt.Printf("%v\n", details)
			matcher.handler.serveHTTP(w, r, details)
		}
	}
	if !found {
		panic(errors.New("No path found!"))
	}
}

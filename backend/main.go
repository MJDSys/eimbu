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
	"flag"

	"net/http"
)

var prefix = flag.String("prefix", "", "The prefix to use to identify this installation.")

func main() {
	if !flag.Parsed() {
		flag.Parse()
	}

	http.Handle("/", http.StripPrefix(*prefix, regexHandler))

	regexHandler.Handle("/test", HttpHandlerRestHandler{5})
	regexHandler.Handle("/test/", HttpHandlerRestHandler{5})
	regexHandler.Handle("/test/{id}", HttpHandlerRestHandler{5})

	regexHandler.Handle("/api/ses/{request}", oauthFlowHandler{})

	panic(http.ListenAndServe("localhost:8080", http.DefaultServeMux))
}

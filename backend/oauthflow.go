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
	"fmt"

	"io"

	"log"

	"net/http"

	"code.google.com/p/goauth2/oauth"
)

var token string

type oauthFlowHandler struct{}

func (h oauthFlowHandler) serveHTTP(w http.ResponseWriter, r *http.Request, matches map[string]string) {
	config := &oauth.Config{
		ClientId:     "631158609582.apps.googleusercontent.com",
		ClientSecret: "64Ep6yXSLIZX9uT7jSoD6_Ue",
		Scope:        "https://www.googleapis.com/auth/userinfo.profile",
		AuthURL:      "https://accounts.google.com/o/oauth2/auth",
		TokenURL:     "https://accounts.google.com/o/oauth2/token",
		RedirectURL:  "http://localhost/eimbu/api/ses/oauth2callback",
	}
	transport := &oauth.Transport{Config: config}
	if matches["request"] == "verify_session" {
		//transport := &oauth.Transport{Config: config}
		var code string = ""

		if code == "" {
			// Get an authorization code from the data provider.
			// ("Please ask the user if I can access this resource.")
			url := config.AuthCodeURL("")
			http.Redirect(w, r, url, 302)
		}
	} else {
		params := r.URL.Query()

		token, err := transport.Exchange(params["code"][0])
		if err != nil {
			log.Fatal("Exchange:", err)
		}
		// (The Exchange method will automatically cache the token.)
		fmt.Printf("Token is cached in %v\n", config.TokenCache)

		// Make the actual request using the cached token to authenticate.
		// ("Here's the token, let me in!")
		transport.Token = token

		// Make the request.
		r, err := transport.Client().Get("https://www.googleapis.com/oauth2/v1/userinfo")
		if err != nil {
			log.Fatal("Get:", err)
		}
		defer r.Body.Close()

		// Write the response to standard output.
		io.Copy(w, r.Body)
	}
}

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
	var regexHandler = NewHttpHandlerRegexMatcher()

	http.Handle("/", http.StripPrefix(*prefix, regexHandler))

	regexHandler.Handle("/test", HttpHandlerRestHandler{5})
	regexHandler.Handle("/test/", HttpHandlerRestHandler{5})
	regexHandler.Handle("/test/{id}", HttpHandlerRestHandler{5})

	regexHandler.Handle("/api/ses/{request}", oauthFlowHandler{})

	panic(http.ListenAndServe("localhost:8080", http.DefaultServeMux))
}

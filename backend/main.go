package main

import (
	"flag"

	"net"
	"net/http"
	"net/http/fcgi"

	"os"

	"syscall"
)

var prefix = flag.String("prefix", "", "The prefix to use to identify this installation.")
var socket = flag.String("socket", "/tmp/eimbu.socket", "The fcgi socket to listen on.")

func main() {
	if !flag.Parsed() {
		flag.Parse()
	}
	var regexHandler = NewHttpHandlerRegexMatcher()

	http.Handle("/", http.StripPrefix(*prefix, regexHandler))

	regexHandler.Handle("/test", HttpHandlerRestHandler{5})
	regexHandler.Handle("/test/", HttpHandlerRestHandler{5})
	regexHandler.Handle("/test/{id}", HttpHandlerRestHandler{5})

	regexHandler.Handle("/ses/{request}", oauthFlowHandler{})

	var socket = *socket

	os.Remove(socket)

	oldUmask := syscall.Umask(000)
	l, err := net.Listen("unix", socket)
	syscall.Umask(oldUmask)
	if err != nil {
		panic(err)
	}

	panic(fcgi.Serve(l, http.DefaultServeMux))
}

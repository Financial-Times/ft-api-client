API_KEY := $(shell cat ~/.ftapi)

.PHONY: test

install:
	origami-build-tools install

test:
	# origami-build-tools verify
	mocha test test/models

test-debug:
	mocha --debug-brk test test/models

example:
	export DEBUG=*; export apikey=`cat ~/.ftapi`; node examples/article

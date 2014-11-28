.PHONY: test

test:
	@./node_modules/.bin/mocha test test/models

test-debug:
	@./node_modules/.bin/mocha --debug-brk test test/models

example:
	@export DEBUG=*; export apikey=`cat ~/.ftapi`; node examples/article

refresh-pages:
	@export apikey=`cat ~/.ftapi`; curl -H "X-Api-Key: ${apikey}" -o data/pagesList.json http://api.ft.com/site/v1/pages

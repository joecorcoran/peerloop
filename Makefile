all:
	mkdir -p lib
	cp node_modules/systemjs/dist/system-csp-production.js lib/system.js
	./node_modules/.bin/babel src -d lib -s
install:
	npm install --save-dev
clean:
	rm -rf lib

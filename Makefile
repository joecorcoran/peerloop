all:
	mkdir -p lib
	cp node_modules/systemjs/dist/system-csp-production.js lib/system.js
	cp node_modules/dexie/dist/dexie.js lib/dexie.js
	./node_modules/.bin/babel src -d lib -s
install:
	npm install
clean:
	rm -rf lib

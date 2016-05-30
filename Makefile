all:
	mkdir -p lib
	cp node_modules/systemjs/dist/system-csp-production.js lib/system.js
	cp node_modules/dexie/dist/dexie.js lib/dexie.js
	./node_modules/.bin/babel src -d lib -s
test:
	make
	mkdir -p spec/lib
	find spec/*spec.js | xargs -I {} ./node_modules/.bin/babel {} -d lib
	./node_modules/.bin/testem ci
install:
	npm install
clean:
	rm -rf lib

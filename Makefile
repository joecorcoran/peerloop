all:
	mkdir -p lib && ./node_modules/.bin/babel src -d lib
install:
	npm install --save-dev
clean:
	rm -rf lib

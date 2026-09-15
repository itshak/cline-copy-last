.PHONY: help
help: ## show make targets
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {sub("\\n",sprintf("\n%22c"," "), $$2);printf " \033[36m%-20s\033[0m  %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install install-frozen
install: ## install project dependencies
	npm install

install-frozen: ## install dependencies from lockfile
	npm ci

.PHONY: clean build
clean: ## clean build artifacts
	npm run clean

build: ## compile the project
	npm run build

.PHONY: lint typecheck test test-watch check ci
lint: ## run eslint
	npm run lint

typecheck: ## run TypeScript type checking
	npm run typecheck

test: ## run unit tests
	npm run test

test-watch: ## run tests in watch mode
	npm run test:watch

check: ## run all checks (lint + typecheck + test + build)
	npm run check

ci: install-frozen check ## install from lockfile and run all checks

.PHONY: package pack-dry-run publish-npm
package: ## create npm package tarball
	npm run package

pack-dry-run: ## preview npm package contents without publishing
	npm run pack:dry-run

publish-npm: ## publish package to npm
	npm run publish:npm

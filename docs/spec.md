# Specification

Here are what we want to get and display. Written in loose Swagger/JSON imitation. Some checks can be extrapolated - for instance, does `description` match the `description` in the `package.json`.

#### Organization

```json
{
  "organization": {
    "users": Int,
    "location": String,
    "website": String,
    "repositories": Int,
    "description": String,
    "email": String,
    "pinned_repositories": Array[String]
  }
}
```

#### Repository

```json
{
  "name": String,
  "owner": String,
  "stars": Int,
  "issues": Int,
  "pull_requests": Int,
  "description": String,
  "tags": Array[String],
  "contributors": Array[String]
  "badges": {
    "Travis": URL,
    "CircleCI": URL,
    "Coveralls": URL,
    "npm": URL
  },
  "readme": {
    "exists": Bool,
    "greaterThan500Chars": Bool,
    "standardized": Bool,
    "sections": {
      "TOC": Bool,
      "Install": Bool,
      "Usage": Bool,
      "Maintainer(s)": Bool,
      "Contribute": Bool,
      "License": Bool,
      "todos": Bool
    }
  },
  "license": {
    "exists": Bool,
    "matchesReadme": Bool,
    "type": String,
    "licensee": String,
    "year": String
  },
  "contribute": Bool,
  "patents": Bool,
  "AUTHORS": Bool,
  "coc": Bool,
  "package.json": { 
    "description": String,
    "author": String,
    "license": String,
    "homepage": String,
    "bugs": String,
    "git": {Object}
  }
}
```
#!/bin/bash

echo "Important note"
echo "You need to add the following files"
echo "  - data/els/xsd These are the xsd files for the els service. You can get them from the els service repo."

mkdir -p data
mkdir -p data/config
mkdir -p data/db/mongo
mkdir -p data/db/postgres
mkdir -p data/db/config
mkdir -p data/els
mkdir -p data/els/input
mkdir -p data/els/output
mkdir -p data/els/xsd
mkdir -p data/file_share
mkdir -p data/user-images

if [ ! -f data/config/secure.yaml ]; then
  echo "Creating data/config/secure.yaml with default content"
  echo """secure:
    redmine:
      key:
      url: https://pm.hausheld.info/
  """ > data/config/secure.yaml
else
  echo "data/config/secure.yaml already exists, to create a new one, please delete the existing one and run this script again"
fi


if [ ! -f data/config/application.yaml ]; then
  echo "Creating data/config/application.yaml with default content"
  echo """
spring:
    application:
      name: WorkTool
      version: 1.0.0
    data:
      mongodb:
        uri: \"mongodb://mongo:27017/dev_board\"
    h2:
      console:
        settings:
          web-allow-others: true
    datasource:
      url: \"jdbc:postgresql://postgres:5432/dev_board\"
      username: user
      password: password
    jpa:
      database-platform: org.hibernate.dialect.PostgreSQLDialect
      hibernate:
        ddl-auto: update
    web:
      resources:
        static-locations: \"file:src/main/resources/static/\"
        add-mappings: true
    devtools:
      restart:
        additional-paths: \"file:src/main/resources/static/\"
      remote:
        trigger-file: .trigger-file
    servlet:
      multipart:
        max-file-size: \"2048MB\"
        max-request-size: \"2048MB\"
server:
    tomcat:
      max-swallow-size: 2147483647
haevn:
    application:
      els:
        input:
          path: /data/els/input
        output:
          path: /data/els/output
        xml:
          path: /data/els/tmp/xml
        xsd:
          file: /data/els/xsd/ELS21_Zusammenbautraeger_angepasst.xsd
      file_share:
        path: /data/file_share
      redmine:
        tmp_file: /data/redmine.json
        debug: false
      data:
        root: /data
    user:
      image:
        path: /data/user-images""" > data/config/application.yaml
else
  echo "data/config/application.yaml already exists, to create a new one, please delete the existing one and run this script again"
fi

echo "Done. Please check the above files and edit them with your specific configuration."
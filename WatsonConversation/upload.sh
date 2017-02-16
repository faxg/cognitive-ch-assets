#!/bin/bash
node ./csv-export/wconv-csv.js export -i ./SwissInsuranceChatbot.xlsx
WORKSPACE_ID=5dfa2686-1c58-4abf-b678-4ab227972e13
USER=0af776c8-f6db-4c7a-8e2b-372a63480a8d
PASSWORD=J3G4HslZgMFZ
VERSION=2016-09-20

curl \
-u "${USER}":"${PASSWORD}" "https://gateway.watsonplatform.net/conversation/api/v1/workspaces/${WORKSPACE_ID}?version=${VERSION}&export=true" > service-export.log.json

npm run clean
npm install
./retrieve.sh
npm run build # to build src/dev/vaccine-data-into-schema.ts
node dist/dev/vaccine-data-into-schema.js
npm test # (builds entire source again)

# Tire Structured data extractor

This project aim to extract structured data from tire description.

## Training set

Training set are readable object nodejs stream located in src/trainingsets

Sample output :
```
{ document: 'PNEU MICHELIN PILOT SPORT 4 205/40R17 84 Y', class: 'michelin' }
```

 * document : current document
 * class : current classification
 
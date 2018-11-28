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


Results :
2018-11-28 brand with natural bayes with default tokenizer and stemmer :
{ success: 481,
  failures: 26717,
  'success rate': 0.01768512390616957 }

2018-11-29 brand with natural bayes with bayes word of bags :
{ success: 481,
  failures: 26717,
  'success rate': 0.01768512390616957 }
 
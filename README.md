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


## Cli

### Training
```
./src/cli/index.js train --help
index.js train [classifier] [training]

train a classifier

Positionals:
  classifier  classifier to train
  training    training set to train with

Options:
  --help         Affiche de l'aide                                     [booléen]
  --version      Affiche le numéro de version                          [booléen]
  --verbose, -v                                                  [défaut: false]
```

### Trainingset informations
```
index.js trainingset [training]

output training set to stdout

Positionals:
  training  training set name

Options:
  --help                     Affiche de l'aide                         [booléen]
  --version                  Affiche le numéro de version              [booléen]
  --stats                    display training set statitics      [défaut: false]
  --filterClassMinFrequency  filter classes with less frequency
                                                        [nombre] [défaut: false]
  --verbose, -v                                                  [défaut: false]
```

Results :
2018-11-28 brand with natural bayes with default tokenizer and stemmer :
{ success: 481,
  failures: 26717,
  'success rate': 0.01768512390616957 }

2018-11-29 brand with natural bayes with bayes word of bags :
{ success: 481,
  failures: 26717,
  'success rate': 0.01768512390616957 }

Brand training set statistics : 
```
"documents": {
    "count": 27198
},
"classes": {
    "count": 170,
    "max": 2716,
    "min": 1,
    "mean": 159.98823529411771,
    "1th-quartile": 2,
    "2th-quartile": 6,
    "3th-quartile": 75
}    
```
Big classes distribution may perform poorly with bayes => Need to validate this by filtering training set with
classes having high frequencies (> 3rd quartile) 

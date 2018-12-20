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
  --load         model file to load        [chaine de caractère] [défaut: false]
  --save         model file to save        [chaine de caractère] [défaut: false]
  --verbose, -v                                                  [défaut: false]                                                 [défaut: false]
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

2018-11-30
Brand training set keeping classes with > 2000 frequency :
```
node src/cli/index.js trainingset ./data/brand-f2000.jsonl --stats
{
    "documents": {
        "count": 9208
    },
    "classes": {
        "count": 4,
        "max": 2716,
        "min": 2039,
        "mean": 2302,
        "1th-quartile": 2103.5,
        "2th-quartile": 2226.5,
        "3rd-quartile": 2500.5
    }
}
node src/cli/index.js train bayes ./data/brand-f2000.jsonl
{"success":9208,"failures":0,"success rate":1}
```
=> Perfect result
3 hypotheses to explain differences with previous results :
 * less document = betters results
 * less classes = better results
 * more balanced training set = better results

With  less documents : 
```
node src/cli/index.js trainingset ./data/brand-f2000-d50.jsonl --stats
{
    "documents": {
        "count": 200
    },
    "classes": {
        "count": 4,
        "max": 50,
        "min": 50,
        "mean": 50,
        "1th-quartile": 50,
        "2th-quartile": 50,
        "3rd-quartile": 50
    }
}
node src/cli/index.js train bayes ./data/brand-f2000-d50.jsonl 
{"success":200,"failures":0,"success rate":1}
```
=> Perfect result

As brand-f2000.jsonl (9208 documents) and brand-f2000-d50.jsonl (200 documents) have a 100% success rate we can remove "less document = betters results" from previous hypotheses.  

2 hypotheses left :
 * less classes = better results
 * more balanced training set = better results

With more classes :
```
node src/cli/index.js trainingset ./data/brand-f50-d50.jsonl --stats
{
    "documents": {
        "count": 2250
    },
    "classes": {
        "count": 45,
        "max": 50,
        "min": 50,
        "mean": 50,
        "1th-quartile": 50,
        "2th-quartile": 50,
        "3rd-quartile": 50
    }
}
node src/cli/index.js train bayes ./data/brand-f50-d50.jsonl 
{"success":2242,"failures":8,"success rate":0.9964444444444445}
```

=> Mostly perfect result

So we can say that more balanced training set has better results and classes count has a lightest impact prediction quality.

2018-12-20

Generate brand.jsonl using delticom + effiliation trainingset
```
node src/cli/index.js trainingset ./data/brand.jsonl --stats
node src/cli/index.js trainingset ./data/brand.jsonl --stats
{
    "documents": {
        "count": 33147
    },
    "classes": {
        "count": 187,
        "max": 3387,
        "min": 1,
        "mean": 177.25668449197846,
        "1th-quartile": 2,
        "2th-quartile": 6,
        "3rd-quartile": 66
    }
}
```
Generate  brand-f66.jsonl by filtering class with less than 3rd quartile document
```
node src/cli/index.js trainingset ./data/brand-f66.jsonl --stats
{
    "documents": {
        "count": 31760
    },
    "classes": {
        "count": 47,
        "max": 3387,
        "min": 66,
        "mean": 675.7446808510638,
        "1th-quartile": 162,
        "2th-quartile": 368,
        "3rd-quartile": 925,
    }
}
node src/cli/index.js train bayes ./data/brand-f66.jsonl
{"success":30290,"failures":1470,"success rate":0.9537153652392947}
```

Generate ./data/brand-f66-d368.jsonl by filtering documents max with median
```
node src/cli/index.js trainingset ./data/brand-f66-d368.jsonl --stats
{
    "documents": {
        "count": 12721
    },
    "classes": {
        "count": 47,
        "max": 368,
        "min": 66,
        "mean": 270.6595744680852,
        "1th-quartile": 162,
        "2th-quartile": 368,
        "3rd-quartile": 368,
    }
}
node src/cli/index.js train bayes ./data/brand-f66-d368.jsonl
{"success":12611,"failures":110,"success rate":0.9913528810628095}
```
=> Good results by filtering classes with less documents than 3th-quartile and then with limiting document to 2th-quartile per classes


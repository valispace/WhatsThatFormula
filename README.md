# WhatsThatFormula 
An online cheatsheet for engineers
---

This repository maintain data for [WhatsThatFormula](https://www.whatsthatformula.com), built and maintained by Valispace.


## Contribute

To contribute a formula to the dataset:
1. Write the details of the formula use the following JSON snippet:
```
  {
        "name": "{Formula name}",
        "latex": "$$ {formula TeX code here} $$",
        "description": "{give a short description for the formula}",
        "definition": {
            "{variable1}": "{description}",
            "{variable2}": "{description}",
            "{variablen}": "{description}"
            
        },
        "keywords": [
            "{keyword1}",
            "{keyword2}",
            "{keywordn}"
        ],
        "tags": [
            "{tag1}",
            "{tag2}"
        ],
        "href": "{Insert a link to find more details}",
        "contributed_by": "{Your Name}"
    }

```

Replace `{...}` with the corresponding information. Your entry should look like this [example](https://github.com/valispace/WhatsThatFormula/blob/master/example.json).

2. Append this entry to `raw-formulae.json` to [this file](https://github.com/valispace/WhatsThatFormula/blob/master/raw_formulae.json)

3. Submit a pull request with the modified `raw-formulae.json.


## Notes

- For the `latex` field, write your formula between `$$   $$`, and use double backslash `\\` for commands. e.g. `\\pi`, `\\Delta` , `\\frac{}{}` etc.
- Keywords are used for search. e.g. the rocket equation can be described by keywords: `["rocket", "delta-v", "tsiolkovski", "momentum"]`
- Tags are used for categorization: e.g. the rocket equation can be categorized by tags: `['Aerospace', 'Propulsion']`


### Thank you for your contribution to this cheat sheet! 
Use issues to tell us about any problems you face during contribution





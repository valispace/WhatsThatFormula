import json
import os
import requests
import datetime
from requests.exceptions import HTTPError

class Helpers:
    def get_all_ids(entries):
            ids = []
            for entry in entries:
                ids.append(entry['id'])
            return ids

    def fetch_raw_json(fetch_url):

        try:
            response = requests.get(fetch_url)
            parsed = response.json()

            response.raise_for_status()
        except HTTPError as http_err:
            print(f'HTTP error occurred: {http_err}')
        except Exception as err:
            print(f'Other error occurred: {err}')

        return parsed

    def load_json(json_file):
        with open(json_file, 'r') as jfile:
            loaded = json.load(jfile)
        return loaded

    def get_unique_id(ids):

        this_id = None

        while this_id == None or this_id in ids:
            if len(ids) == 0 :
                this_id=1
            else:
                this_id=max(ids) +1

        return this_id



class Formulae:
    def __init__(self, new_data, update_target):
        self.raw = self.preprocess_raw(new_data)
        self.old = update_target
        old_ids = Helpers.get_all_ids(self.old)
        self.ids = old_ids
        self.check_raw()
        self.updated_raw = self.assignIds(self.raw, old_ids)
        self.final = None

    def preprocess_raw(self, rawdata):
        # Use this to check fields and consistency of raw json
        # simple tests if required
        return NotImplementedError

    def assignIds(self, raw, old_ids):
        updated = []
        for entry in raw:
            thisId = Helpers.get_unique_id(old_ids)
            entry['id'] = thisId
            self.ids.append(thisId)
            udpated.append(entry)
        return updated

    def check_raw(self):
        return NotImplementedError

    def update_main_json(self):
        #assign final
        return NotImplementedError

    def backup_json(target_dir):
        #Backup old json formulae file
        dt =  datetime.datetime.now().strftime("%Y-%m-%d_%H_%M_%S")
        backup_fname = f"formulae_backup_{dt}.json"
        target= os.path.join(target_dir,backup_fname)
        with open(target, 'r') as jsonfile:
            json.dump(self.old, jsonfile, indent=4)
        print(f"Backup Formulae file created: {target}")
        return

    def post_updated_github(self, post_url):
        headers = {
            'Content-type': 'application/json',
        }

        if self.final != None:
            response = requests.post(post_url, headers=headers, data=self.final)
            return response
        else:
            Exception('Final data is None! Update the new formula json')




## delete later
def repeat_entry_uniquely(entry, count):
    entries = []
    for i in range(count):
        this_entry = entry
        this_entry['id'] = Helpers.get_unique_id(entries)
        entries.append(this_entry)

    return entries


## fetch
ghub_url = ''
old_json_dir = '' #local
new_raw = Helpers.fetch_raw_json(ghub_url)
old_json = Helpers.load_json(old_json_dir)


WTF = Formulae(...)
WTF.backup_json(...)
WTF.update_main_json()
WTF.post_updated_github()

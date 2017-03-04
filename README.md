# Fresh Install
 As root from same directory as README.md (this file)
1. Run `npm install` to install required nodejs libraries

2. Run `node build/setup.js`

Backup of current database will be saved in `build/bkp` with UNIX timestamp

# Empty Data and Local Files Before GIT Push
1. Save `build/bkp` locally then `rm build/bkp/*` to clear unwanted backups
2. Save `data.db` locally then `rm data.db` to clear current database
3. Run `rm -r node_modules` to clear local builds of node libraries

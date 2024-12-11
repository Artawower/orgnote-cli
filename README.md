
# Table of Contents

1.  [Introduction](#orgaeb61d0)
2.  [Connected links](#orgf421265)
3.  [️ Install](#org7862b05)
4.  [Usage](#org08400a0)
    1.  [Configuration](#orga07d666)
    2.  [Available commands](#org4596d4b)
    3.  [Available flags](#org9a8820c)
5.  [Encryption.](#orged5afb7)
6.  [🍩 Contribute guide](#orga6ce78e)

<div align='center'>

<img src='./images/image.png' width='256px' height='256px'>

</div>

&nbsp;

<div align='center'>

<span class='badge-buymeacoffee'>

<a href='https://www.paypal.me/darkawower' title='Paypal' target='_blank'><img src='https://img.shields.io/badge/paypal-donate-blue.svg' alt='Buy Me A Coffee donate button' /></a>

</span>

<span class='badge-patreon'>

<a href='https://patreon.com/artawower' target='_blank' title='Donate to this project using Patreon'><img src='https://img.shields.io/badge/patreon-donate-orange.svg' alt='Patreon donate button' /></a>

</span>

<a href='https://wakatime.com/badge/github/Artawower/orgnote-client'><img src='https://wakatime.com/badge/github/Artawower/orgnote-client.svg' alt='wakatime'></a>

</div>

<div align='center'>

<a href="https://twitter.com/org_note" target="_blank"><img src="https://img.shields.io/twitter/follow/org_note" alt="Twitter link" /></a>

<a href="https://emacs.ch/@orgnote" target="_blank"><img alt="Mastodon Follow" src="https://img.shields.io/mastodon/follow/113090697216193319?domain=https%3A%2F%2Ffosstodon.org&style=social"></a>

<a href="https://discord.com/invite/SFpUb2vSDm" target="_blank"><img src="https://img.shields.io/discord/1161751315324604417" alt="Discord"></a>

<a href="https://www.youtube.com/@OrgNote" target="_blank"><img alt="YouTube Channel Views" src="https://img.shields.io/youtube/channel/views/UCN14DUE5umdrlEm7odW3gOw"></a>

</div>

<div align='center'>

<a href="https://play.google.com/store/apps/details?id=org.note.app" target="_blank">

<img src="./images/google-play.svg" width="140px" height="auto">

</a>

</div>


<a id="orgaeb61d0"></a>

# Introduction

NPM binary script for synchronising and publishing notes from org roam. Closely related to the Org Note project.
**WARNING**: This package doesn't provide a way to resolve conflicts and doesn't use CRDT yet! Be careful, and don't forget to backup your notes!


<a id="orgf421265"></a>

# Connected links

-   [Org Note main repo.](https://github.com/Artawower/orgnote)


<a id="org7862b05"></a>

# ️ Install

    npm install -g orgnote-cli


<a id="org08400a0"></a>

# Usage


<a id="orga07d666"></a>

## Configuration

Create `~/.config/orgnote/config.json` with next schema:

    export interface OrgNotePublishedConfig {
      remoteAddress: string;
      token: string;
      rootFolder: string;
      version: string;
      name?: string;
      debug?: boolean;
      logPath?: string;
      backupCount?: number;
      backupDir?: string;
      encrypt?: 'gpgPassword' | 'gpgKeys' | 'disabled';
    
      gpgPassword?: string;
      gpgPublicKeyPath?: string;
      gpgPrivateKeyPath?: string;
      gpgPrivateKeyPassphrase?: string;
    
    }

Example

    [
      {
        "name": "User 1",
        "remoteAddress": "http://localhost:8000/v1",
        "token": "289cd69d-e9fb-4ad0-a907-d44e46cac786",
        "rootFolder": "~/tmp/org-roam",
        "logPath": "~/tmp/logs/orgnote.log",
        "encrypt": "gpgPassword",
        "gpgPassword": "password"
      },
      {
        "name": "Local development",
        "remoteAddress": "http://localhost:8000/v1",
        "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "rootFolder": "~/some/path/",
        "backupDir": "/tmp/orgnote/backups",
        "backupCount": 2
      },
      {
        "name": "Remote development",
        "remoteAddress": "http://<address>/api/v1",
        "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        "rootFolder": "~/some/path/"
      },
    ]


<a id="org4596d4b"></a>

## Available commands

-   `publish` - publish single note
    `orgnote-cli publish  --remote-address http://url-here/ --token api-token /file/path`
-   `collect` -  forces loading of all notes from a remote resource. **WARNING**: this operation could override your local notes! 
    *Unsupported yet*
-   `publish-all` force publishing of all notes from the root folder. **WARNING**: this operation could overwrite remote notes.
-   `sync` - syncs all notes from the root folder into the remote service and vice versa. **WARNING**: this operation could override local and remote notes depens on timezone.


<a id="org9a8820c"></a>

## Available flags

`--debug` enable additional info logging messages
`--force` clear local cache and last sync time


<a id="orged5afb7"></a>

# Encryption.

For exporting keys use next commands ([check official doc](https://www.gnupg.org/documentation/)). Make sure you have orgnote folder inside your `.config`

    mkdir -p ~/.config/orgnote

Export public key:

    gpg --armor --export <ID> > ~/.config/orgnote/public.key

Export private key

    gpg --armor --export-secret-key <ID> > ~/.config/orgnote/private.key


<a id="orga6ce78e"></a>

# 🍩 Contribute guide

Any contribution is very much appreciated! Please read the [style guide](./CONTRIBUTE.md) before contributing to avoid misunderstandings!
I would also appreciate it if you would consider becoming my [patron](https://www.patreon.com/artawower)

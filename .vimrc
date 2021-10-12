set nocompatible              " be iMproved, required
filetype off                  " required

let mapleader = '`'

set rtp+=~/.vim/bundle/Vundle.vim
call vundle#rc("~/.vim/bundle/")

Plugin 'VundleVim/Vundle.vim'
Plugin 'morhetz/gruvbox'
Plugin 'oblitum/youcompleteme'
Plugin 'jbgutierrez/vim-babel'
Plugin 'mattn/webapi-vim'
Plugin 'sheerun/vim-polyglot'
Plugin 'dense-analysis/ale'
Plugin 'loremipsum'
Plugin 'prettier/vim-prettier', {'do': 'npm install'}
Plugin 'vimwiki/vimwiki'

set nu rnu

set tabstop=2
set shiftwidth=2
set softtabstop=2
set autoindent
set smartindent
set cindent

let g:ale_set_loclist = 0
let g:ale_set_quickfix = 1

syntax on
colorscheme gruvbox
set background=dark
set cul
highlight CursorLine ctermbg=236

setlocal fdm=manual
nnoremap <silent> <Space> @=(foldlevel('.')?'za':"\<Space>")<CR>
vnoremap <Space> zf
autocmd BufWinLeave *.* mkview
autocmd BufWinEnter *.* silent loadview
:set foldcolumn=3
highlight FoldColumn  gui=bold    guifg=grey65     guibg=Grey90
highlight Folded      gui=italic  guifg=Black      guibg=Grey90
highlight LineNr      gui=NONE    guifg=grey60     guibg=Grey9

nnoremap <F2> :Prettier <Enter>

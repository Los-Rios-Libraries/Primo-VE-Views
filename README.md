# Primo VE Views - Los Rios Community College District Libraries
This is the Primo VE customization package for the Los Rios Libraries, with separate views for American River College, Cosumnes River College, Folsom Lake College, and Sacramento City College.
This package is made with some distinctive features:
- custom.js has per-view variables listed at the top. This allows us to use the same code below a certain part of custom.js, so if we make a number of changes in one, we just need to copy-paste to the others
- a function near the top of the package identifies the path of the customization file for that view, which allows us to provide references to view-specific resources without varying the code from view to view
- some templates are in html files. It's possible to include these in custom.js, but using separate html templates allows different colleges to vary the language as desired. It also allows tweaking of the template more easily. footer.html and top-announcement.html are good examples of how this practice helps us.
- use of custom directives within the "after" directives. This is not always necessary but seems like good practice. In some situation it's necessary to include more than one component within an "after" directive, and this enables us to do so. Our custom directives are prefaced by "lr".

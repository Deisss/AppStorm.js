/*! ***********************************************************************

    License: MIT Licence

    Description:
        Provide a simple ACL rules checker to create different application
        behavior regarding user role

************************************************************************ */


/**
 * Provide a simple ACL rules checker to create different application
 * behavior regarding user role.
*/
a.acl = a.extend(new function() {
    var mem = a.mem.getInstance('app.acl');

    /**
     * Set the current user role.
     *
     * @param {String} role                 The role to set as 'current' one
    */
    this.setCurrentRole = function(role) {
        mem.set('current', role);
        this.dispatch('change', role);
        a.message.dispatch('a.acl.change', role);
    };

    /**
     * Get the current user role stored.
     *
     * @return {String}                     The role found, or an empty
     *                                      string if nothing has been found
    */
    this.getCurrentRole = function() {
        return mem.get('current') || '';
    };

    /**
     * Set the current role list. This is used to compare the role to a list.
     *
     * SO: the list order is important! It has to go from the minimum role
     * (less privileges) to the maximum role (more privileges). Ex:
     * ['user', 'leader', 'super administrator']
     * is OK...
     * If one role is not listed here, and still used, it will be consider
     * as minimum role (less than all listed here).
     *
     * Note: this function is quite important, as it register related
     * handlebars helpers: if you create role ['admin', 'superAdmin'], it
     * will automatically create handlebars helpers 'isAdmin' and
     * 'isSuperAdmin', they will both accept a string as parameter, and work
     * as a if: {{isSuperAdmin 'superAdmin'}} will work,
     * {{isSuperAdmin 'superadmin'}} will work too (not case sensitive)
     * Note also you can't pass an object: {{isSuperAdmin user}} will not work
     * if user is not the role in string you want to check...
     *
     * @param {Array} roleList              The role list to store
    */
    this.setRoleList = function(roleList) {
        if(a.isArray(roleList)) {
            mem.set('list', roleList);

            // We create related Handlebars helpers for every role
            // Like you get a role 'adMin', it will create 'isAdMin' helper
            a.each(roleList, function(role) {
                var helper = a.firstLetterUppercase(role, 'is'),
                    lower  = role.toLowerCase();

                Handlebars.registerHelper(helper, function(value, options) {
                    if(a.trim(value.toLowerCase()) === a.trim(lower)) {
                        return options.fn(this);
                    }
                    return options.inverse(this);
                });
            });
        }
    };

    /**
     * Get the current role list.
     *
     * @return {Array | Null}               The current role list stored, or
     *                                      null if nothing is found
    */
    this.getRoleList = function() {
        return mem.get('list');
    };

    /**
     * Check if current role is allowed compare to given minimum role.
     *
     * @param {String} minimumRole          The minimum role to check
     * @param {String | Null} currentRole   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The allowed (true) or refused
     *                                      (false) state
    */
    this.isAllowed = function(minimumRole, currentRole) {
        currentRole = currentRole || this.getCurrentRole();

        var positionCurrentRole = -1,
            positionMinimumRole = -1,
            roleList = this.getRoleList() || [],
            position = roleList.length;

        // Search position in current role list
        while(position--) {
            if(roleList[position]  == minimumRole) {
                positionMinimumRole = position;
            }

            if(roleList[position]  == currentRole) {
                positionCurrentRole = position;
            }

            // Stop before if possible
            if(positionMinimumRole != -1 && positionCurrentRole != -1) {
                break;
            }
        }

        return (positionCurrentRole >= positionMinimumRole);
    };

    /**
     * Check if current role is refused compare to given minimum role.
     *
     * @param {String} minimumRole          The minimum role to check
     * @param {String | null} currentRole   The current role, if undefined, it
     *                                      will use getCurrentRole instead
     * @return {Boolean}                    The refused (true) or allowed
     *                                      (false) state
    */
    this.isRefused = function(minimumRole, currentRole) {
        return !this.isAllowed(minimumRole, currentRole);
    };

    /**
     * Clear the full ACL rules
    */
    this.clear = function() {
        mem.clear();
    };

}, new a.eventEmitter('a.acl'));



/*
------------------------------
  HANDLEBARS HELPERS
------------------------------
*/
(function() {
    Handlebars.registerHelper('AclRole', function(options) {
        return new Handlebars.SafeString(a.acl.getCurrentRole());
    });

    // Allow to check role is allowed or not
    Handlebars.registerHelper('AclIsAllowed', function(minimumRole, currentRole,
                                                                    options) {
        // We allow 2 or 3 parameters mode !
        options = a.isString(currentRole) ? options : currentRole;
        currentRole = a.isString(currentRole) ? currentRole :
                                                    a.acl.getCurrentRole();

        // We check role is allowed or not
        if(a.acl.isAllowed(minimumRole, currentRole)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    // Allow to check role is refused or not
    Handlebars.registerHelper('AclIsRefused', function(minimumRole, currentRole,
                                                                    options) {
        // We allow 2 or 3 parameters mode !
        options = a.isString(currentRole) ? options : currentRole;
        currentRole = a.isString(currentRole) ? currentRole :
                                                    a.acl.getCurrentRole();

        // We check role is allowed or not
        if(a.acl.isAllowed(minimumRole, currentRole)) {
            return options.inverse(this);
        }
        return options.fn(this);
    });
})();
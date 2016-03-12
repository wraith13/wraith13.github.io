// hand include from http://ngmodules.org/modules/Angular.uuid
//'use strict' d3 周りのコードが上手く機能しなくなる問題が解決されたらコメントをハズすこと。
angular.module('angularUUID2', []).factory('uuid2', [
    function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return {

            newuuid: function () {
                // http://www.ietf.org/rfc/rfc4122.txt
                var s = [];
                var hexDigits = "0123456789abcdef";
                for (var i = 0; i < 36; i++) {
                    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
                s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
                s[8] = s[13] = s[18] = s[23] = "-";
                return s.join("");
            },
            newguid: function () {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }
        }

    }]);

//window.onload = function () {
//    var pickerOptions = {
//        success: function(files) {
//            // Handle returned file object(s)
//            alert("You picked " + files.values[0].fileName);
//        },
//
//        cancel: function() {
//            // handle when the user cancels picking a file
//        },
//
//        linkType: "webViewLink", // or "downloadLink",
//        multiSelect: false // or true
//    };
//    var pickerButton = OneDrive.createOpenButton(pickerOptions);
//    document.getElementById("picker").appendChild(pickerButton);
//};

var app = angular.module("splatournament", ['ui.router', "ui.bootstrap", "angularUUID2"]);

app.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

//  http://stackoverflow.com/questions/17893708/angularjs-textarea-bind-to-json-object-shows-object-object
app.directive('jsonText', function() {
    return {
        restrict: 'A', // only activate on element attribute
        require: 'ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModelCtrl) {

            var lastValid;

            // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
            ngModelCtrl.$parsers.push(fromUser);
            ngModelCtrl.$formatters.push(toUser);

            // clear any invalid changes on blur
            element.bind('blur', function() {
                element.val(toUser(scope.$eval(attrs.ngModel)));
            });

            // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
            // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
            scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                lastValid = lastValid || newValue;

                if (newValue != oldValue) {
                    ngModelCtrl.$setViewValue(toUser(newValue));

                    // TODO avoid this causing the focus of the input to be lost..
                    ngModelCtrl.$render();
                }
            }, true); // MUST use objectEquality (true) here, for some reason..

            function fromUser(text) {
                // Beware: trim() is not available in old browsers
                if (!text || text.trim() === '') {
                    return {};
                } else {
                    try {
                        lastValid = angular.fromJson(text);
                        ngModelCtrl.$setValidity('invalidJson', true);
                    } catch (e) {
                        ngModelCtrl.$setValidity('invalidJson', false);
                    }
                    return lastValid;
                }
            }

            function toUser(object) {
                // better than JSON.stringify(), because it formats + filters $$hashKey etc.
                return angular.toJson(object, true);
            }
        }
    };
});

app.controller("splatournament", function ($rootScope, $window, $scope, $http, $location, $filter, uuid2) {

    //  http://stackoverflow.com/questions/20789373/shuffle-array-in-ng-repeat-angular
    $scope.shuffleArray = function (array) {
        var m = array.length, t, i;

        // While there remain elements to shuffle
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    }

    //  http://stackoverflow.com/questions/23120077/how-to-get-the-indexof-an-object-within-an-angularjs-response-object-collection
    $scope.arrayObjectIndexOf = function (arr, obj) {
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            }
        }
        return -1;
    }

    $scope.alerts = [];
    $scope.addAlert = function (alert) {
        $scope.alerts.push(alert);
    };
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.toJson = function (object) {
        return angular.toJson(object, true);
    };

    $scope.app = {
        type: "app",
        name: "splatournament",
        description: "このツールは Wii U 用ゲームソフト、『スプラトゥーン』で草の根的に行われる各種トーナメント形式での大会向けのトーナメント管理ツールです。",
        version: "X.XX.XXX"
    };
    $rootScope.title = $scope.app.name;

    $http({
        method: 'GET',
        url: "version.json"
    }).success(function (data, status, headers, config) {
        $scope.app.version = data;
    }).error(function (data, status, headers, config) {
    });

    $scope.regulateModel = function () {
        $scope.repository = {};
        $scope.selected = {};
        $scope.cache = {};
        $scope.model = $scope.model || {};
        $scope.model.event = $scope.model.event || { type: "event" };
        $scope.makeSureId($scope.model.event);
        $scope.repository.entry = $scope.model.entries = $scope.model.entries || [];
        $scope.repository.member = $scope.model.members = $scope.model.members || [];
        $scope.repository.match = $scope.model.matches = $scope.model.matches || [];
        $scope.initTag();
    };
    $scope.initTag = function () {
        $scope.tags = {};
        angular.forEach(["entry", "member", "match"], function (type, i) {
            $scope.tags[type] = [];
            var temp_repository = {};
            angular.forEach($scope.repository[type], function (object, i) {
                angular.forEach(object.tags || [], function (tag, j) {
                    if (temp_repository[tag]) {
                        ++(temp_repository[tag].count);
                    } else {
                        $scope.tags[type].push(temp_repository[tag] = { name: tag, count: 1 });
                    }
                });
            });
        });
    };

    var data_json = $location.search()["data"];
    if (data_json && 0 < data_json.length) {
        $scope.is_loading = true;
        $http({
            method: 'GET',
            url: data_json
        }).success(function (data, status, headers, config) {
            $scope.model = data;
            $scope.regulateModel();
            $scope.viewmode = true;
            $scope.tabs = ["entry", "member", "match", "tree"];
            $scope.selectTab($location.hash());
            $rootScope.title = $scope.app.name = $scope.model.event.name;
            $scope.app.type = $scope.model.event.type;
            $scope.is_loading = false;
        }).error(function (data, status, headers, config) {
            $scope.addAlert({ type: 'danger', msg: 'インポート中にエラーが発生しました。 '});
            $scope.is_loading = false;
        });
    }

    //$scope.change = function () {
    //};

    $scope.tabIcon = {
        "app": "globe",
        "event": "tower",
        "entry":"flag",
        "member":"user",
        "match":"flash",
        "import": "cloud-upload",
        "export":"cloud-download",
        "tree": "tree-conifer"
    };
    $scope.mastertabs = ["event", "entry", "member", "match", "import", "export", "tree"];
    $scope.tabs = $scope.mastertabs;
    $scope.selectTab = function (tab) {
        $scope.selected = {};
        $scope.isCollapsed = false;
        if (0 <= $scope.mastertabs.indexOf(tab)) {
            $scope.active_tab = tab;
        } else {
            $scope.active_tab = null;
        }
        if ("match" == $scope.active_tab) {
            $scope.update_unmatches();
        }
        if ("tree" == $scope.active_tab) {
            $scope.update_tree();
        }
    };
    setTimeout(function () {
        $scope.selectTab($location.hash());
    }, 0);

    //  cache
    $scope.getCache = function (type, key) {
        return ($scope.cache[type] || { })[key];
    }
    $scope.setCache = function (type, key, value) {
        $scope.cache[type] = $scope.cache[type] || {};
        $scope.cache[type][key] = value;
    }

    //  select
    $scope.selectObject = function (type, object) {
        return $scope.selected[type] = $scope.getObject(type, object);
    }
    $scope.getObject = function (type, object) {
        if (null == object || "object" == typeof (object)) {
            return object;
        } else {
            var result = $scope.getCache(type, object);
            if (!result) {
                angular.forEach($scope.repository[type], function (value, i) {
                    if (object == value.id) {
                        result = value;
                        $scope.setCache(type, object, value);
                    }
                });
            }
            return result;
        }
    };
    $scope.addObject = function (type, object) {
        var sure_object = object || {};
        sure_object.type = type;
        $scope.repository[type].push(sure_object);
        $scope.selectObject(type, sure_object);
    };
    $scope.removeObject = function (type, object) {
        var index = $scope.repository[type].indexOf(object);
        $scope.repository[type].splice(index, 1);
        $scope.selectObject(type, null);
    };
    $scope.showObject = function (object) {
        var id = $scope.makeSureId(object);
        var entry = $scope.getEntry(id);
        if (entry) {
            $scope.selectTab("entry");
            $scope.selectEntry(entry);
            $scope.$apply();
            return entry;
        }
        var match = $scope.getMatch(id);
        if (match) {
            $scope.selectMatch(match);
            $scope.$apply();
            return match;
        }
    }

    //  id
    $scope.makeSureId = function (object) {
        if (null != object && "object" == typeof (object)) {
            if (!object.id) {
                object.id = uuid2.newuuid();
            }
            return object.id;
        } else {
            return object; // null or id
        }
    };
    $scope.getEntry = function (id) {
        return $scope.getObject("entry", id);
    };
    $scope.searchEntry = function (id) {
        var result = $scope.getCache("search_entry", id);
        if (!result) {
            result = $scope.getEntry(id);
            if (!result) {
                var match = $scope.getMatch(id);
                if (match) {
                    if (1 == match.entries.length) {
                        result = $scope.searchEntry(match.entries[0]);
                    } else if (match.winners && 1 == match.winners.length) {
                        result = $scope.searchEntry(match.winners[0]);
                    }
                }
            }
            if (result) {
                $scope.setCache("search_entry", id, result);
            }
        }
        return result;
    };
    $scope.getMatch = function (id) {
        return $scope.getObject("match", id);
    };
    $scope.getNextMatch = function (id) {
        var result = 0;
        angular.forEach($scope.model.matches, function (match, i) {
            if (match.entries && 0 <= match.entries.indexOf(id)) {
                result = match;
            }
        });
        return result;
    };

    //  entry
    $scope.selectEntry = function (entry) {
        $scope.selectObject("entry", entry);

        $scope.selected.entryMatches = [];
        if ($scope.selected.entry && $scope.model.matches) {
            var match = $scope.selected.entry;
            while (match = $scope.getNextMatch(match.id)) {
                $scope.selected.entryMatches.push(match);
            }
        }
    }
    $scope.addEntry = function () {
        $scope.addObject("entry");
    };
    $scope.removeEntry = function (entry) {
        $scope.removeObject("entry", entry);
    };
    $scope.filterByTag = function (object) {
        var result = true;
        var filterTags = $scope.getFilterTags(object.type);
        if (filterTags) {
            angular.forEach(filterTags, function (tag, i) {
                if ($scope.arrayObjectIndexOf(object.tags || [], tag.name) < 0) {
                    result = false;
                }
            });
        }
        return result;
    };
    $scope.filterEntry = function (value, index, array) {
        var search = $scope.selected.entrySearch;
        return (!(search) ||
            0 == search.length ||
            0 <= (value.name || "").indexOf(search) ||
            0 <= (value.description || "").indexOf(search) ||
            0 <= (value.url || "").indexOf(search)) &&
            $scope.filterByTag(value);
    }

    //  member
    $scope.selectMember = function (member) {
        $scope.selectObject("member", member);

        $scope.selected.memberMatches = [];
        if ($scope.selected.member && $scope.model.matches) {
            var match = $scope.selected.member;
            while (match = $scope.getNextMatch(match.id)) {
                $scope.selected.memberMatches.push(match);
            }
        }
    }
    $scope.addMember = function () {
        $scope.addObject("member");
    };
    $scope.removeMember = function (member) {
        $scope.removeObject("member", member);
    };
    $scope.filterMember = function (value, index, array) {
        var search = $scope.selected.memberSearch;
        return (!(search) ||
            0 == search.length ||
            0 <= (value.name || "").indexOf(search) ||
            0 <= (value.description || "").indexOf(search) ||
            0 <= (value.url || "").indexOf(search)) &&
            $scope.filterByTag(value);
    }

    //  match
    $scope.selectMatch = function (match) {
        if (match) {
            $scope.selectTab("match");
        }
        $scope.selectObject("match", match);
    }
    $scope.get_matched_entries = function () {
        var result = [];
        angular.forEach($scope.model.matches, function (match, i) {
            angular.forEach(match.entries, function (entry, j) {
                if (result.indexOf(entry) < 0) {
                    result.push(entry);
                }
            });
        });
        return result;
    };
    $scope.update_unmatches = function () {
        var matched_entries = $scope.get_matched_entries();

        $scope.unmatches = [];
        angular.forEach($scope.model.entries, function (entry, i) {
            var entry_id = $scope.makeSureId(entry);
            if (matched_entries.indexOf(entry_id) < 0) {
                $scope.unmatches.push(entry_id);
            }
        });

        var entries_count = $scope.model.entries.length;
        var matched_entries_count = entries_count - $scope.unmatches.length;
        $scope.over_bit_level = matched_entries_count < (entries_count & ~matched_entries_count);
    };
    $scope.regulateMatch = function () {
        var lastMatch = null;
        var display_count = 0;
        angular.forEach($scope.model.matches, function (match, i) {
            if (2 <= match.entries.length) {
                match.name = "第" + (++display_count) + "試合";
                match.weight = 0;
                match.level = 0;
                angular.forEach(match.entries, function (entry, i) {
                    var subMatch = $scope.getMatch(entry);
                    if (subMatch) {
                        match.weight += subMatch.weight;
                        match.level = Math.max(match.level, subMatch.level);
                    } else {
                        match.weight += 1;
                    }
                });
                match.level += 1;
                lastMatch = match;
            } else {
                match.weight = match.entries.length;
                match.level = 0;
            }
        });
        if (null != lastMatch) {
            lastMatch.name = "決勝戦";
            var number = 0;
            angular.forEach(lastMatch.entries, function (match_id, i) {
                var match = $scope.getMatch(match_id);
                if (null != match && null != match.entries && 2 <= match.entries.length) {
                    match.name = "準決勝 第" + (++number) + "試合";
                }
            });
        }
        $scope.update_unmatches();
    }
    $scope.makeMatch = function () {
        var shuffle_unmatches = $scope.shuffleArray(angular.fromJson(angular.toJson($scope.unmatches, true)));
        var entries_count = $scope.model.entries.length;
        var unmatched_match = [];
        var addMatch = function (entries) {
            var match = { type:"match" };
            match.entries = entries;
            $scope.model.matches.push(match);
            unmatched_match.push(match);
        };

        //  level 0 マッチの生成
        while (($scope.model.matches.length * 2) < entries_count) {
            do {
                addMatch([shuffle_unmatches.shift()]);
            } while ($scope.model.matches.length & ($scope.model.matches.length -1)); // 次の 2^n 境界の数までマッチを作成
        }

        //  level 1 マッチの生成
        var matched_entry_count = $scope.model.matches.length;
        var tournament_tree_capacity = $scope.model.matches.length * 2;
        var add_count = 0;
        var delta = 0.00001; // 浮動小数点演算誤差で最後の要素が追加されないことを防ぐ為の補正
        for (var i = 0; i < $scope.model.matches.length; ++i) {
            if (add_count < (((i * (entries_count - matched_entry_count)) / (tournament_tree_capacity /2)) + delta)) {
                ++add_count;
                var entry = shuffle_unmatches.shift();
                if (entry) {
                    $scope.model.matches[i].entries.push(entry);
                } else {
                    console.log("【🐛バグ】shuffle_unmatches が足りない。計算があってない。");
                }
            }
        }
        if (0 < shuffle_unmatches.length) {
            console.log("【🐛バグ】shuffle_unmatches が余った。計算があってない。");
        }

        //  level 2 以降のマッチの生成
        while (true) {
            var match1 = unmatched_match.shift();
            var match2 = unmatched_match.shift();
            if (match1 && match2) {
                addMatch([$scope.makeSureId(match1), $scope.makeSureId(match2)]);
            } else {
                break;
            }
        }

        $scope.regulateMatch();
    };
    $scope.appendMatch = function () {
        console.log("【🐛バグ】ここはまだ実装中！！！💢💢💢");

        var entries_count = $scope.model.entries.length;
        var matched_entries_count = entries_count - $scope.unmatches.length;
        var over_bit_level = matched_entries_count < (entries_count & ~matched_entries_count);
        if (over_bit_level) {
            // level を底上げする
        }
        var shuffle_unmatches = $scope.shuffleArray(angular.fromJson(angular.toJson($scope.unmatches, true)));

        //  level 1 マッチの生成
        var matched_entry_count = $scope.model.matches.length;
        var tournament_tree_capacity = $scope.model.matches.length * 2;
        var add_count = 0;
        var delta = 0.00001; // 浮動小数点演算誤差で最後の要素が追加されないことを防ぐ為の補正
        for (var i = 0; i < $scope.model.matches.length; ++i) {
            if ($scope.model.matches[i].entries.length < 2) {
                if (add_count < (((i * (entries_count - matched_entry_count)) / (tournament_tree_capacity / 2)) + delta)) {
                    ++add_count;
                    var entry = shuffle_unmatches.shift();
                    if (entry) {
                        $scope.model.matches[i].entries.push(entry);
                    } else {
                        console.log("【🐛バグ】shuffle_unmatches が足りない。計算があってない。");
                    }
                }
            }
        }
        if (0 < shuffle_unmatches.length) {
            console.log("【🐛バグ】shuffle_unmatches が余った。計算があってない。");
        }

        $scope.regulateMatch();
    };
    $scope.remakeMatch = function () {
        $scope.cache = {};
        $scope.model.matches = [];
        $scope.update_unmatches();
        $scope.makeMatch();
    };
    $scope.showEntry = function (entry) {
        var entryBody = $scope.searchEntry(entry);
        if (entryBody) {
            $scope.selectTab("entry");
            $scope.selectEntry(entryBody);
        }
    }
    $scope.setWinner = function (match, entry) {
        var winner = $scope.searchEntry(entry);
        if (match && winner) {
            if (match.winners && 0 <= match.winners.indexOf(entry)) {
                match.winners = [];
            } else {
                match.winners = [entry];
            }
        }
        $scope.cache = {};
    }
    $scope.getMatchEntryClass = function (match, entry) {
        if ($scope.searchEntry(entry)) {
            if (match.winners && 0 < match.winners.length) {
                if (0 <= match.winners.indexOf(entry)) {
                    return 'list-group-item-success';
                } else {
                    return 'list-group-item-danger';
                }
            } else {
                return 'list-group-item-info';
            }
        }
        return 'list-group-item-warning';
    }
    $scope.getMatchResultClass = function (match, entry) {
        if ($scope.searchEntry(entry)) {
            if (match.winners && 0 < match.winners.length) {
                if (0 <= match.winners.indexOf(entry)) {
                    return 'glyphicon glyphicon-ok';
                } else {
                    return 'glyphicon glyphicon-remove';
                }
            }
        }
        return '';
    }
    $scope.filterMatch = function (value, index, array) {
        var sub_filterMatch = function (value) {
            return !($scope.selected.matchSearch) ||
                0 == $scope.selected.matchSearch.length ||
                0 <= (value.name || "").indexOf($scope.selected.matchSearch) ||
                0 <= (value.description || "").indexOf($scope.selected.matchSearch) ||
                0 <= (value.url || "").indexOf($scope.selected.matchSearch);
        };
        var result = sub_filterMatch(value);
        if (!result) {
            angular.forEach(value.entries, function (entry, i) {
                if (!result) {
                    var sub_entry = $scope.searchEntry(entry);
                    if (sub_entry) {
                        result = 0 <= (sub_entry.name || "").indexOf($scope.selected.matchSearch);
                    } else {
                        var sub_match = $scope.getMatch(entry);
                        if (sub_match) {
                            result = sub_filterMatch(sub_match);
                        }
                    }
                }
            });
        }
        if (result) {
            result = $scope.filterByTag(value);
        }
        return result;
    }

    //  import
    $scope.import = function (text) {
        try {
            $scope.model = angular.fromJson(text);
            $scope.regulateModel();
            $scope.addAlert({ type: 'success', msg: 'インポートしました。' });
        } catch (e) {
            $scope.addAlert({ type: 'danger', msg: 'インポート中に例外が発生しました。 ' + e });
        }
    };

    //  tree
    var vis = d3.select("#chart").append("svg").append("g");
    
    angular.element($window).on('resize', function () { $scope.update_tree(); });
    $scope.update_tree = function () {
        if ($scope.model.matches && 0 < $scope.model.matches.length) {
            var document_height = document.documentElement.clientHeight -144;
            var document_width = document.documentElement.clientWidth;

            var height_count = ($scope.model.entries.length - ($scope.unmatches || []).length);
            var width_count = $scope.model.matches[$scope.model.matches.length -1].level +2.0;

            var height_base_unit = 32;
            var width_base_unit = 64;

            var height_unit = Math.max(document_height / height_count, height_base_unit);
            var width_unit = Math.max(document_width / width_count, width_base_unit);

            var is_double_side_mode = 2.1 <= (width_unit / width_base_unit) / (height_unit / height_base_unit);
            if (is_double_side_mode) {
                height_count = height_count /2.0;
                width_count = width_count *2.0;;

                height_unit = Math.max(document_height / height_count, height_base_unit);
                width_unit = Math.max(document_width / width_count, width_base_unit);
            }

            var font_size = 12 * (1 + (((width_unit - width_base_unit) / width_base_unit) + ((height_unit - height_base_unit) / (height_base_unit * 2))) / 4);

            //var margin = { top: 30, right: 10, bottom: 10, left: 10 },
            var margin = { top: 32, right: 0, bottom: 16, left: 0 },
                //width = screen.width - margin.left - margin.right,
                width = (width_count * width_unit),
                //halfWidth = width / 2,
                halfWidth = is_double_side_mode ? (width /2): (width - (width_unit * 0.75)),
                height = (height_count * height_unit),
                i = 0,
                duration = 1500,
                root;

            var getChildren = function (d) {
                var a = [];
                if (d.entries) for (var i = 0; i < d.entries.length; i++) {
                    //d.entries[i].is_right = false;
                    d.entries[i].parent = d;
                    a.push(d.entries[i]);
                }
                return a.length ? a : null;
            };

            var tree = d3.layout.tree()
                .size([height, width]);
            vis.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var diagonal = d3.svg.diagonal()
                .projection(function (d) { return [halfWidth -(d.y - halfWidth), d.x]; });
            var elbow = function (d, i) {
                var source = calcLeft(d.source);
                var target = calcLeft(d.target);
                var hy = (target.y - source.y) / 2;
                if (d.is_right) hy = -hy;
                return "M" + source.y + "," + source.x
                        + "H" + (source.y + hy)
                        + "V" + target.x + "H" + target.y;
            };
            var connector = elbow;
            //var connector = diagonal

            var calcLeft = function (d) {
                var result = { x: d.x, y: d.y };
                if (is_double_side_mode) {
                    if (d.is_root || d.is_semi_root) {
                        result.x = height / 4;
                    } else if (d.is_right) {
                        result.x -= height / 2;
                    }
                    result.x *= 2;
                }
                if (!d.is_right) {
                    result.y = d.y - halfWidth;
                    result.y = halfWidth - result.y;
                }
                return result;
            };

            d3.select("#chart svg")
                .attr("left", 0)
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom);
                //.append("g")
                //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var update_tournament_tree = function (json, showObject) {
                root = json;
                root.x0 = height / 2 +margin.left;
                root.y0 = width / 2 +margin.top;

                var t1 = d3.layout.tree().size([height, halfWidth]).children(function (d) { return d.entries; });
                t1.separation(function (a, b) {
                    // default code is return a.parent == b.parent ? 1 : 2;
                    return 1;
                });
                t1.nodes(root);

                var rebuildChildren = function (node) {
                    node.children = getChildren(node);
                    if (node.children) node.children.forEach(rebuildChildren);
                }
                rebuildChildren(root);
                root.is_right = false;
                update(root, showObject);
            }

            var toArray = function (item, arr) {
                arr = arr || [];
                var i = 0, l = item.children ? item.children.length : 0;
                arr.push(item);
                for (; i < l; i++) {
                    toArray(item.children[i], arr);
                }
                return arr;
            };

            var update = function (source, showObject) {
                // Compute the new tree layout.
                var nodes = toArray(source);

                // Normalize for fixed-depth.
                nodes.forEach(function (d) { d.y = d.depth * width_unit + halfWidth; });

                // Update the nodes…
                var node = vis.selectAll("g.node")
                    .data(nodes, function (d) { return d.id || (d.id = ++i); });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", function (d) {
                        return (d.name && 0 < d.name.length) ? "node" : "null";
                    })
                    .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
                //.on("click", click);

                nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

                nodeEnter.append("text")
                    .attr("dy", function (d) { return -8;/*d.is_right ? 14 : -8;*/ })
                    .attr("text-anchor", "middle")
                    .on("click", function (d) {
                        if (d.name) { showObject(d.original_id) }
                    })
                    .text(function (d) { return d.name; })
                    .attr("font-size", 1)
                    .style("fill-opacity", 1e-6);

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function (d) { p = calcLeft(d); return "translate(" + p.y + "," + p.x + ")"; });

                nodeUpdate.select("circle")
                    .attr("r", 4.5)
                    .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

                nodeUpdate.select("text")
                    .attr("font-size", font_size)
                    //.style("fill-opacity", 1);
                    .style("fill-opacity", function (d) { return d.is_loser ? 0.5 : 1; });

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function (d) { p = calcLeft(d.parent || source); return "translate(" + p.y + "," + p.x + ")"; })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .attr("font-size", 1)
                    .style("fill-opacity", 1e-6);

                // Update the links...
                var link = vis.selectAll("path.link")
                    .data(tree.links(nodes), function (d) { return d.target.id; });

                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", function (d) {
                        return (d.target.is_winner || (d.source.is_winner && 1 == d.source.entries.length)) ? "link winner" : "link";
                    })
                    .attr("d", function (d) {
                        var o = { x: source.x0, y: source.y0 };
                        return connector({ source: o, target: o });
                    });

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("class", function (d) {
                        return (d.target.is_winner || (d.source.is_winner && 1 == d.source.entries.length)) ? "link winner" : "link";
                    })
                    .attr("d", connector);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = calcLeft(d.source || source);
                        if (d.source.is_right) o.y -= halfWidth - (d.target.y - d.source.y);
                        else o.y += halfWidth - (d.target.y - d.source.y);
                        return connector({ source: o, target: o });
                    })
                    .remove();
                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    var p = calcLeft(d);
                    d.x0 = p.x;
                    d.y0 = p.y;
                });

                // Toggle children on click.
                //function click(d) {
                //    if (d.children) {
                //        d._children = d.children;
                //        d.children = null;
                //    } else {
                //        d.children = d._children;
                //        d._children = null;
                //    }
                //    update(source, showObject);
                //}
            }
            //d3.json("bracket.json", update_tournament_tree);

            var match_to_tree = function (match, is_winner, is_loser, is_right, is_root) {
                var result = {
                    name: match.name,
                    entries: [],
                    is_winner: is_winner,
                    is_loser: is_loser,
                    is_right: is_right,
                    is_root: is_root,
                    is_semi_root: false
                };
                angular.forEach(match.entries, function (entry, i) {
                    var sub_is_winner = false;
                    var sub_is_loser = is_loser;
                    if (match.winners && 0 < match.winners.length) {
                        if (0 <= match.winners.indexOf(entry)) {
                            sub_is_winner = true;
                        } else {
                            sub_is_loser = true;
                        }
                    }
                    var sub_is_right = is_right || (is_root && 0 < i && is_double_side_mode);
                    var sub_result = null;
                    var sub_match = $scope.getMatch(entry);
                    if (sub_match) {
                        sub_result = match_to_tree(sub_match, sub_is_winner, sub_is_loser, sub_is_right, false);
                        sub_result.original_id = sub_match.id;
                    } else {
                        var sub_entry = $scope.getEntry(entry);
                        sub_result = {
                            name: sub_entry.name,
                            is_winner: sub_is_winner,
                            is_loser: sub_is_loser,
                            is_right: sub_is_right
                    };
                        sub_result.original_id = sub_entry.id;
                    }
                    sub_result.is_semi_root = is_root;
                    result.entries.push(sub_result);
                });
                return result;
            };
            update_tournament_tree(match_to_tree($scope.model.matches[$scope.model.matches.length - 1], false, false, false, true), $scope.showObject);
        }
    };

    $scope.clearText = function (object, name) {
        object[name] = "";
    };

    $scope.openCalendar = function (name) {
        $scope.selected["opened" +name +"Calendar"] = true;
    };

    $scope.addTag = function (model) {
        if ($scope.tags.new && 0 < $scope.tags.new.length) {
            var tag = null;
            for (var i = 0; i < $scope.tags[model.type].length; i++) {
                if ($scope.tags[model.type][i].name == $scope.tags.new) {
                    tag = $scope.tags[model.type][i];
                    break;
                }
            };
            if (!tag) {
                tag = { name: $scope.tags.new, count: 0 };
                $scope.tags[model.type].push(tag);
            }

            model.tags = model.tags || [];
            if ($scope.arrayObjectIndexOf(model.tags, tag.name) < 0) {
                model.tags.push(tag.name);
                ++(tag.count);
                $scope.tags.new = "";
            } else {
                //  TODO: 重複エラーを表示
            }
        }
    }
    $scope.toggleTag = function (model, tag) {
        model.tags = model.tags || [];
        var i = $scope.arrayObjectIndexOf(model.tags, tag.name);
        if (0 <= i) {
            model.tags.splice(i, 1);
            --(tag.count);
        } else {
            model.tags.push(tag.name);
            ++(tag.count);
        }
    };
    $scope.getFilterTags = function (type) {
        return $scope.selected[type + 'FilterTags'] = $scope.selected[type + 'FilterTags'] || [];
    }
    $scope.updateFilterTag = function (type) {
        var filterTags = $scope.getFilterTags(type);
        if (0 < filterTags.length) {
            $scope.selected[type + 'FilterTagsLabel'] = "";
            angular.forEach(filterTags, function (tag, i) {
                if (0 < $scope.selected[type + 'FilterTagsLabel'].length) {
                    $scope.selected[type + 'FilterTagsLabel'] += ",";
                }
                $scope.selected[type + 'FilterTagsLabel'] += tag.name;
            });
        } else {
            $scope.selected[type + 'FilterTagsLabel'] = null;
        }
    };
    $scope.clearFilterTag = function (type) {
        var filterTags = $scope.getFilterTags(type);
        filterTags.splice(0, filterTags.length);
        $scope.updateFilterTag(type);
    };
    $scope.toggleFilterTag = function (type, tag) {
        var filterTags = $scope.getFilterTags(type);
        var i = $scope.arrayObjectIndexOf(filterTags, tag);
        if (0 <= i) {
            filterTags.splice(i, 1);
        } else {
            filterTags.push(tag);
        }
        $scope.updateFilterTag(type);
    };

    $scope.addLink = function (model, link) {
        model.links = model.links || [];
        model.links.push(link || { type: "link" });
    };
    $scope.removeLink = function (model, link) {
        var index = model.links.indexOf(link);
        model.links.splice(index, 1);

    };

    $scope.regulateModel();

    $scope.checkResults = [];

    $scope.$watchCollection('checkModel', function () {
        $scope.checkResults = [];
        angular.forEach($scope.checkModel, function (value, key) {
            if (value) {
                $scope.checkResults.push(key);
            }
        });
    });
});

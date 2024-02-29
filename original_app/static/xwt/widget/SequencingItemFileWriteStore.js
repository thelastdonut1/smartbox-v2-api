/* ************************************************** */
/* Copyright (c) 2009-2010, 2015 Cisco Systems, Inc.       */
/* All rights reserved.                               */
/* ************************************************** */

//dojo.provide("xwt.widget.tests.table.store.SequencingItemFileWriteStore");
dojo.provide("xwt.widget.SequencingItemFileWriteStore");

dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("xwt.widget.table.Filter");

dojo.declare("xwt.widget.SequencingItemFileWriteStore", [dojo.data.ItemFileWriteStore], {
	constructor: function(params){
		this.orderAttribute = params.orderAttribute;
		this._features["generateId"] = true;
		this.filterOnServer = params.filterOnServer;
	},
	//fetch: xwt.widget.table.Filters.filteringFetch,
	fetch: function(args){
		var wrappedArgs = args;
		if(this.orderAttribute){
			wrappedArgs = dojo.mixin({}, args);
			function areSortsEqual(a, b){
				if((a == null && b != null) || (a != null && b == null)){ return false; }
				if(a.length != b.length){ return false; }
				for(var i=a.length; i--;){
					if(a[i]['attribute'] != b[i]['attribute']){ return false; }
					if(a[i]['descending'] != b[i]['descending']){ return false; }
				}
				return true;
			}
			var self = this;
			var ls = this._lastSort, st = args.sort;
			if(st != ls && st != null){
				if(ls == null || !areSortsEqual(st, ls)){
					this.inherited(arguments, [{
						start: 0,
						sort: st,
						onComplete: function(results){
							for(var i =0; i < results.length; i++){
								self._setValueOrValues(results[i], self.orderAttribute, i, false);
							}
							if(!self._hasNewOrDelete()){
								self.save();
							}
						}
					}]);
				}
			}
			if(args.sort){
				var self = this;
				var start = args.start || 0;
				wrappedArgs.onComplete = function(results){
						for(var i =0; i < results.length; i++){
							self._setValueOrValues(results[i], self.orderAttribute, i + start, false); 
						}
						if(!self._hasNewOrDelete()){
							self.save();
						}
						args.onComplete(results, args);
					};
			}
			else{
				wrappedArgs.sort = [{attribute: this.orderAttribute}];
			}
		}
		if (this.filterOnServer)
		{wrappedArgs.filterOnServer = this.filterOnServer;}
		if(args.filter){
			xwt.widget.table.Filters.filteringFetch.call(this, wrappedArgs);
		}else{
			return this.inherited(arguments, [wrappedArgs]);
		}
	},
	
	_hasNewOrDelete: function(){
		// summary:
		//		Function to test if there are any pending saves for new or deleted items.
		//		Used to not auto-save a new or delete in IFWS when used with new row
		//		and the editor state.
		var hasNewOrDelete = false;
		if(this._pending){
			var ni = this._pending._newItems;
			var di = this._pending._deletedItems;
			
			if(!ni && !di){
				hasNewOrDelete = false;
			}else{
				var i
				if(ni){
					for(i in ni){
						hasNewOrDelete = true;
						break;
					}
				}
				if(!hasNewOrDelete && di){
					for(i in di){
						hasNewOrDelete = true;
						break;
					}
				}
			}		
		}
		//console.log("HAS NEW: ", hasNewOrDelete, this._pending);
		return hasNewOrDelete;
	},
	
	orderAttribute: "",
	
	moveTo:  function(items, beforeItem, afterItem){
		var factor = 1,
			start = 0;
		if(!beforeItem){
			start = this.getValue(afterItem, this.orderAttribute) - (items.length + 1);
		}else if(!afterItem){
			start = this.getValue(beforeItem, this.orderAttribute);
		}else{
			start = this.getValue(beforeItem, this.orderAttribute);
			factor = (this.getValue(afterItem, this.orderAttribute) - start) / (items.length + 1);
		}
		var self = this;
		// sort the items into a new array
		items = items.slice().sort(function(a, b){
			return self.getValue(a, self.orderAttribute) > self.getValue(b, self.orderAttribute) ? 1 : -1;
		});
		for(var i=1, len=items.length; i<=len; i++){
			var item = items[i-1];
			this._setValueOrValues(item, this.orderAttribute, start + (i * factor), false);
		}
	},
	
	setValuesOnAllItems: function(attributes, excludedItems){
		excludedItems = excludedItems || [];
		var store = this;
		this.fetch({
			onComplete: function(allItems){
				for(var i = 0, l = allItems.length; i < l; i++){
					var item = allItems[i];
					if(dojo.indexOf(excludedItems, item) === -1){
						for(var j in attributes){
							store.setValue(item, j, attributes[j]);
						}
					}
				}
			}
		});
	},

	
	
	getParent: function(item){
		var references = item[this._reverseRefMap];
		for(var itemId in references){
			var containingItem = null;
			if(this._itemsByIdentity){
				containingItem = this._itemsByIdentity[itemId];
			}else{
				containingItem = this._arrayOfAllItems[itemId];
			}
			return containingItem;
		}
	}
});

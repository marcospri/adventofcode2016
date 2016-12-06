
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		var name = v.func ? v.func.name : v.name;
		return '<function' + (name === '' ? '' : ':') + name + '>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

var _elm_lang$core$Native_Bitwise = function() {

return {
	and: F2(function and(a, b) { return a & b; }),
	or: F2(function or(a, b) { return a | b; }),
	xor: F2(function xor(a, b) { return a ^ b; }),
	complement: function complement(a) { return ~a; },
	shiftLeftBy: F2(function(offset, a) { return a << offset; }),
	shiftRightBy: F2(function(offset, a) { return a >> offset; }),
	shiftRightZfBy: F2(function(offset, a) { return a >>> offset; })
};

}();

var _elm_lang$core$Bitwise$shiftRightZfBy = _elm_lang$core$Native_Bitwise.shiftRightZfBy;
var _elm_lang$core$Bitwise$shiftRightBy = _elm_lang$core$Native_Bitwise.shiftRightBy;
var _elm_lang$core$Bitwise$shiftLeftBy = _elm_lang$core$Native_Bitwise.shiftLeftBy;
var _elm_lang$core$Bitwise$complement = _elm_lang$core$Native_Bitwise.complement;
var _elm_lang$core$Bitwise$xor = _elm_lang$core$Native_Bitwise.xor;
var _elm_lang$core$Bitwise$or = _elm_lang$core$Native_Bitwise.or;
var _elm_lang$core$Bitwise$and = _elm_lang$core$Native_Bitwise.and;

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		var value = result._0;
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		currentSend(incomingValue);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;
	
	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}	
	
	return _elm_lang$core$Native_List.fromArray(is);
}

function toInt(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
		start = 1;
	}
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
	}
	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function toFloat(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
		}
		start = 1;
	}
	var dotCount = 0;
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if ('0' <= c && c <= '9')
		{
			continue;
		}
		if (c === '.')
		{
			dotCount += 1;
			if (dotCount <= 1)
			{
				continue;
			}
		}
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	return _elm_lang$core$Result$Ok(parseFloat(s));
}

function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (!a.options === b.options)
	{
		if (a.stopPropagation !== b.stopPropagation || a.preventDefault !== b.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { callback(); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _sanichi$elm_md5$MD5$g = F3(
	function (x, y, z) {
		return (x & z) | (y & (~z));
	});
var _sanichi$elm_md5$MD5$f = F3(
	function (x, y, z) {
		return (x & y) | ((~x) & z);
	});
var _sanichi$elm_md5$MD5$iget = F2(
	function (index, array) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			A2(_elm_lang$core$Array$get, index, array));
	});
var _sanichi$elm_md5$MD5$ixor = F2(
	function (x, y) {
		return x ^ y;
	});
var _sanichi$elm_md5$MD5$h = F3(
	function (x, y, z) {
		return A2(
			_sanichi$elm_md5$MD5$ixor,
			z,
			A2(_sanichi$elm_md5$MD5$ixor, x, y));
	});
var _sanichi$elm_md5$MD5$i = F3(
	function (x, y, z) {
		return A2(_sanichi$elm_md5$MD5$ixor, y, x | (~z));
	});
var _sanichi$elm_md5$MD5$addUnsigned = F2(
	function (x, y) {
		var result = (x & 1073741823) + (y & 1073741823);
		var y4 = y & 1073741824;
		var x4 = x & 1073741824;
		var y8 = y & 2147483648;
		var x8 = x & 2147483648;
		return (_elm_lang$core$Native_Utils.cmp(x4 & y4, 0) > 0) ? A2(
			_sanichi$elm_md5$MD5$ixor,
			y8,
			A2(
				_sanichi$elm_md5$MD5$ixor,
				x8,
				A2(_sanichi$elm_md5$MD5$ixor, result, 2147483648))) : ((_elm_lang$core$Native_Utils.cmp(x4 | y4, 0) > 0) ? ((_elm_lang$core$Native_Utils.cmp(result & 1073741824, 0) > 0) ? A2(
			_sanichi$elm_md5$MD5$ixor,
			y8,
			A2(
				_sanichi$elm_md5$MD5$ixor,
				x8,
				A2(_sanichi$elm_md5$MD5$ixor, result, 3221225472))) : A2(
			_sanichi$elm_md5$MD5$ixor,
			y8,
			A2(
				_sanichi$elm_md5$MD5$ixor,
				x8,
				A2(_sanichi$elm_md5$MD5$ixor, result, 1073741824)))) : A2(
			_sanichi$elm_md5$MD5$ixor,
			y8,
			A2(_sanichi$elm_md5$MD5$ixor, result, x8)));
	});
var _sanichi$elm_md5$MD5$rotateLeft = F2(
	function (input, bits) {
		return (input << bits) | (input >>> (32 - bits));
	});
var _sanichi$elm_md5$MD5$ff = F7(
	function (a, b, c, d, x, s, ac) {
		var z = A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			a,
			A2(
				_sanichi$elm_md5$MD5$addUnsigned,
				A2(
					_sanichi$elm_md5$MD5$addUnsigned,
					A3(_sanichi$elm_md5$MD5$f, b, c, d),
					x),
				ac));
		return A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			A2(_sanichi$elm_md5$MD5$rotateLeft, z, s),
			b);
	});
var _sanichi$elm_md5$MD5$gg = F7(
	function (a, b, c, d, x, s, ac) {
		var z = A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			a,
			A2(
				_sanichi$elm_md5$MD5$addUnsigned,
				A2(
					_sanichi$elm_md5$MD5$addUnsigned,
					A3(_sanichi$elm_md5$MD5$g, b, c, d),
					x),
				ac));
		return A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			A2(_sanichi$elm_md5$MD5$rotateLeft, z, s),
			b);
	});
var _sanichi$elm_md5$MD5$hh = F7(
	function (a, b, c, d, x, s, ac) {
		var z = A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			a,
			A2(
				_sanichi$elm_md5$MD5$addUnsigned,
				A2(
					_sanichi$elm_md5$MD5$addUnsigned,
					A3(_sanichi$elm_md5$MD5$h, b, c, d),
					x),
				ac));
		return A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			A2(_sanichi$elm_md5$MD5$rotateLeft, z, s),
			b);
	});
var _sanichi$elm_md5$MD5$ii = F7(
	function (a, b, c, d, x, s, ac) {
		var z = A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			a,
			A2(
				_sanichi$elm_md5$MD5$addUnsigned,
				A2(
					_sanichi$elm_md5$MD5$addUnsigned,
					A3(_sanichi$elm_md5$MD5$i, b, c, d),
					x),
				ac));
		return A2(
			_sanichi$elm_md5$MD5$addUnsigned,
			A2(_sanichi$elm_md5$MD5$rotateLeft, z, s),
			b);
	});
var _sanichi$elm_md5$MD5$hexFromInt = function (i) {
	return (_elm_lang$core$Native_Utils.cmp(i, 10) < 0) ? _elm_lang$core$Char$fromCode(
		i + _elm_lang$core$Char$toCode(
			_elm_lang$core$Native_Utils.chr('0'))) : _elm_lang$core$Char$fromCode(
		(i - 10) + _elm_lang$core$Char$toCode(
			_elm_lang$core$Native_Utils.chr('a')));
};
var _sanichi$elm_md5$MD5$toHex = function (i) {
	return (_elm_lang$core$Native_Utils.cmp(i, 16) < 0) ? _elm_lang$core$String$fromChar(
		_sanichi$elm_md5$MD5$hexFromInt(i)) : A2(
		_elm_lang$core$Basics_ops['++'],
		_sanichi$elm_md5$MD5$toHex((i / 16) | 0),
		_elm_lang$core$String$fromChar(
			_sanichi$elm_md5$MD5$hexFromInt(
				A2(_elm_lang$core$Basics_ops['%'], i, 16))));
};
var _sanichi$elm_md5$MD5$wordToHex_ = F3(
	function (input, index, output) {
		wordToHex_:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(index, 3) > 0) {
				return output;
			} else {
				var $byte = (input >>> (index * 8)) & 255;
				var tmp2 = _sanichi$elm_md5$MD5$toHex($byte);
				var tmp1 = _elm_lang$core$Native_Utils.eq(
					_elm_lang$core$String$length(tmp2),
					1) ? '0' : '';
				var _v0 = input,
					_v1 = index + 1,
					_v2 = A2(
					_elm_lang$core$Basics_ops['++'],
					output,
					A2(_elm_lang$core$Basics_ops['++'], tmp1, tmp2));
				input = _v0;
				index = _v1;
				output = _v2;
				continue wordToHex_;
			}
		}
	});
var _sanichi$elm_md5$MD5$wordToHex = function (input) {
	return A3(_sanichi$elm_md5$MD5$wordToHex_, input, 0, '');
};
var _sanichi$elm_md5$MD5$utf8Encode_ = F2(
	function (input, output) {
		utf8Encode_:
		while (true) {
			var split = _elm_lang$core$String$uncons(input);
			var _p0 = split;
			if (_p0.ctor === 'Nothing') {
				return output;
			} else {
				var _p1 = _p0._0._0;
				var c = _elm_lang$core$Char$toCode(_p1);
				var newOutput = (_elm_lang$core$Native_Utils.cmp(c, 128) < 0) ? A2(
					_elm_lang$core$Basics_ops['++'],
					output,
					_elm_lang$core$String$fromChar(_p1)) : ((_elm_lang$core$Native_Utils.cmp(c, 2048) < 0) ? A2(
					_elm_lang$core$Basics_ops['++'],
					output,
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$String$fromChar(
							_elm_lang$core$Char$fromCode((c >> 6) | 192)),
						_elm_lang$core$String$fromChar(
							_elm_lang$core$Char$fromCode((c & 63) | 128)))) : A2(
					_elm_lang$core$Basics_ops['++'],
					output,
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$String$fromChar(
							_elm_lang$core$Char$fromCode((c >> 12) | 224)),
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$String$fromChar(
								_elm_lang$core$Char$fromCode(((c >> 6) & 63) | 128)),
							_elm_lang$core$String$fromChar(
								_elm_lang$core$Char$fromCode((c & 63) | 128))))));
				var _v4 = _p0._0._1,
					_v5 = newOutput;
				input = _v4;
				output = _v5;
				continue utf8Encode_;
			}
		}
	});
var _sanichi$elm_md5$MD5$utf8Encode = function (string) {
	return A2(_sanichi$elm_md5$MD5$utf8Encode_, string, '');
};
var _sanichi$elm_md5$MD5$convertToWordArray_ = F4(
	function (input, byteCount, messageLength, words) {
		convertToWordArray_:
		while (true) {
			var bytePosition = 8 * A2(_elm_lang$core$Basics_ops['%'], byteCount, 4);
			var wordCount = ((byteCount - A2(_elm_lang$core$Basics_ops['%'], byteCount, 4)) / 4) | 0;
			var oldWord = A2(_sanichi$elm_md5$MD5$iget, wordCount, words);
			if (_elm_lang$core$Native_Utils.cmp(byteCount, messageLength) < 0) {
				var str = A3(_elm_lang$core$String$slice, byteCount, byteCount + 1, input);
				var split = _elm_lang$core$String$uncons(str);
				var code = function () {
					var _p2 = split;
					if (_p2.ctor === 'Nothing') {
						return 0;
					} else {
						return _elm_lang$core$Char$toCode(_p2._0._0) << bytePosition;
					}
				}();
				var newWord = oldWord | code;
				var newWords = A3(_elm_lang$core$Array$set, wordCount, newWord, words);
				var _v7 = input,
					_v8 = byteCount + 1,
					_v9 = messageLength,
					_v10 = newWords;
				input = _v7;
				byteCount = _v8;
				messageLength = _v9;
				words = _v10;
				continue convertToWordArray_;
			} else {
				var code = 128 << bytePosition;
				var newWord = oldWord | code;
				var tmp1 = A3(_elm_lang$core$Array$set, wordCount, newWord, words);
				var numberOfWords = _elm_lang$core$Array$length(words);
				var tmp2 = A3(_elm_lang$core$Array$set, numberOfWords - 2, messageLength << 3, tmp1);
				return A3(_elm_lang$core$Array$set, numberOfWords - 1, messageLength >>> 29, tmp2);
			}
		}
	});
var _sanichi$elm_md5$MD5$convertToWordArray = function (input) {
	var messageLength = _elm_lang$core$String$length(input);
	var tmp1 = messageLength + 8;
	var tmp2 = ((tmp1 - A2(_elm_lang$core$Basics_ops['%'], tmp1, 64)) / 64) | 0;
	var numberOfWords = 16 * (tmp2 + 1);
	var words = A2(_elm_lang$core$Array$repeat, numberOfWords, 0);
	return A4(_sanichi$elm_md5$MD5$convertToWordArray_, input, 0, messageLength, words);
};
var _sanichi$elm_md5$MD5$hex_ = F3(
	function (x, k, _p3) {
		hex_:
		while (true) {
			var _p4 = _p3;
			var _p8 = _p4._3;
			var _p7 = _p4._2;
			var _p6 = _p4._1;
			var _p5 = _p4._0;
			if (_elm_lang$core$Native_Utils.cmp(
				k,
				_elm_lang$core$Array$length(x)) > -1) {
				return {ctor: '_Tuple4', _0: _p5, _1: _p6, _2: _p7, _3: _p8};
			} else {
				var d00 = _p8;
				var c00 = _p7;
				var b00 = _p6;
				var a00 = _p5;
				var s44 = 21;
				var s43 = 15;
				var s42 = 10;
				var s41 = 6;
				var s34 = 23;
				var s33 = 16;
				var s32 = 11;
				var s31 = 4;
				var s24 = 20;
				var s23 = 14;
				var s22 = 9;
				var s21 = 5;
				var s14 = 22;
				var s13 = 17;
				var s12 = 12;
				var s11 = 7;
				var a01 = A7(
					_sanichi$elm_md5$MD5$ff,
					a00,
					b00,
					c00,
					d00,
					A2(_sanichi$elm_md5$MD5$iget, k + 0, x),
					s11,
					3614090360);
				var d01 = A7(
					_sanichi$elm_md5$MD5$ff,
					d00,
					a01,
					b00,
					c00,
					A2(_sanichi$elm_md5$MD5$iget, k + 1, x),
					s12,
					3905402710);
				var c01 = A7(
					_sanichi$elm_md5$MD5$ff,
					c00,
					d01,
					a01,
					b00,
					A2(_sanichi$elm_md5$MD5$iget, k + 2, x),
					s13,
					606105819);
				var b01 = A7(
					_sanichi$elm_md5$MD5$ff,
					b00,
					c01,
					d01,
					a01,
					A2(_sanichi$elm_md5$MD5$iget, k + 3, x),
					s14,
					3250441966);
				var a02 = A7(
					_sanichi$elm_md5$MD5$ff,
					a01,
					b01,
					c01,
					d01,
					A2(_sanichi$elm_md5$MD5$iget, k + 4, x),
					s11,
					4118548399);
				var d02 = A7(
					_sanichi$elm_md5$MD5$ff,
					d01,
					a02,
					b01,
					c01,
					A2(_sanichi$elm_md5$MD5$iget, k + 5, x),
					s12,
					1200080426);
				var c02 = A7(
					_sanichi$elm_md5$MD5$ff,
					c01,
					d02,
					a02,
					b01,
					A2(_sanichi$elm_md5$MD5$iget, k + 6, x),
					s13,
					2821735955);
				var b02 = A7(
					_sanichi$elm_md5$MD5$ff,
					b01,
					c02,
					d02,
					a02,
					A2(_sanichi$elm_md5$MD5$iget, k + 7, x),
					s14,
					4249261313);
				var a03 = A7(
					_sanichi$elm_md5$MD5$ff,
					a02,
					b02,
					c02,
					d02,
					A2(_sanichi$elm_md5$MD5$iget, k + 8, x),
					s11,
					1770035416);
				var d03 = A7(
					_sanichi$elm_md5$MD5$ff,
					d02,
					a03,
					b02,
					c02,
					A2(_sanichi$elm_md5$MD5$iget, k + 9, x),
					s12,
					2336552879);
				var c03 = A7(
					_sanichi$elm_md5$MD5$ff,
					c02,
					d03,
					a03,
					b02,
					A2(_sanichi$elm_md5$MD5$iget, k + 10, x),
					s13,
					4294925233);
				var b03 = A7(
					_sanichi$elm_md5$MD5$ff,
					b02,
					c03,
					d03,
					a03,
					A2(_sanichi$elm_md5$MD5$iget, k + 11, x),
					s14,
					2304563134);
				var a04 = A7(
					_sanichi$elm_md5$MD5$ff,
					a03,
					b03,
					c03,
					d03,
					A2(_sanichi$elm_md5$MD5$iget, k + 12, x),
					s11,
					1804603682);
				var d04 = A7(
					_sanichi$elm_md5$MD5$ff,
					d03,
					a04,
					b03,
					c03,
					A2(_sanichi$elm_md5$MD5$iget, k + 13, x),
					s12,
					4254626195);
				var c04 = A7(
					_sanichi$elm_md5$MD5$ff,
					c03,
					d04,
					a04,
					b03,
					A2(_sanichi$elm_md5$MD5$iget, k + 14, x),
					s13,
					2792965006);
				var b04 = A7(
					_sanichi$elm_md5$MD5$ff,
					b03,
					c04,
					d04,
					a04,
					A2(_sanichi$elm_md5$MD5$iget, k + 15, x),
					s14,
					1236535329);
				var a05 = A7(
					_sanichi$elm_md5$MD5$gg,
					a04,
					b04,
					c04,
					d04,
					A2(_sanichi$elm_md5$MD5$iget, k + 1, x),
					s21,
					4129170786);
				var d05 = A7(
					_sanichi$elm_md5$MD5$gg,
					d04,
					a05,
					b04,
					c04,
					A2(_sanichi$elm_md5$MD5$iget, k + 6, x),
					s22,
					3225465664);
				var c05 = A7(
					_sanichi$elm_md5$MD5$gg,
					c04,
					d05,
					a05,
					b04,
					A2(_sanichi$elm_md5$MD5$iget, k + 11, x),
					s23,
					643717713);
				var b05 = A7(
					_sanichi$elm_md5$MD5$gg,
					b04,
					c05,
					d05,
					a05,
					A2(_sanichi$elm_md5$MD5$iget, k + 0, x),
					s24,
					3921069994);
				var a06 = A7(
					_sanichi$elm_md5$MD5$gg,
					a05,
					b05,
					c05,
					d05,
					A2(_sanichi$elm_md5$MD5$iget, k + 5, x),
					s21,
					3593408605);
				var d06 = A7(
					_sanichi$elm_md5$MD5$gg,
					d05,
					a06,
					b05,
					c05,
					A2(_sanichi$elm_md5$MD5$iget, k + 10, x),
					s22,
					38016083);
				var c06 = A7(
					_sanichi$elm_md5$MD5$gg,
					c05,
					d06,
					a06,
					b05,
					A2(_sanichi$elm_md5$MD5$iget, k + 15, x),
					s23,
					3634488961);
				var b06 = A7(
					_sanichi$elm_md5$MD5$gg,
					b05,
					c06,
					d06,
					a06,
					A2(_sanichi$elm_md5$MD5$iget, k + 4, x),
					s24,
					3889429448);
				var a07 = A7(
					_sanichi$elm_md5$MD5$gg,
					a06,
					b06,
					c06,
					d06,
					A2(_sanichi$elm_md5$MD5$iget, k + 9, x),
					s21,
					568446438);
				var d07 = A7(
					_sanichi$elm_md5$MD5$gg,
					d06,
					a07,
					b06,
					c06,
					A2(_sanichi$elm_md5$MD5$iget, k + 14, x),
					s22,
					3275163606);
				var c07 = A7(
					_sanichi$elm_md5$MD5$gg,
					c06,
					d07,
					a07,
					b06,
					A2(_sanichi$elm_md5$MD5$iget, k + 3, x),
					s23,
					4107603335);
				var b07 = A7(
					_sanichi$elm_md5$MD5$gg,
					b06,
					c07,
					d07,
					a07,
					A2(_sanichi$elm_md5$MD5$iget, k + 8, x),
					s24,
					1163531501);
				var a08 = A7(
					_sanichi$elm_md5$MD5$gg,
					a07,
					b07,
					c07,
					d07,
					A2(_sanichi$elm_md5$MD5$iget, k + 13, x),
					s21,
					2850285829);
				var d08 = A7(
					_sanichi$elm_md5$MD5$gg,
					d07,
					a08,
					b07,
					c07,
					A2(_sanichi$elm_md5$MD5$iget, k + 2, x),
					s22,
					4243563512);
				var c08 = A7(
					_sanichi$elm_md5$MD5$gg,
					c07,
					d08,
					a08,
					b07,
					A2(_sanichi$elm_md5$MD5$iget, k + 7, x),
					s23,
					1735328473);
				var b08 = A7(
					_sanichi$elm_md5$MD5$gg,
					b07,
					c08,
					d08,
					a08,
					A2(_sanichi$elm_md5$MD5$iget, k + 12, x),
					s24,
					2368359562);
				var a09 = A7(
					_sanichi$elm_md5$MD5$hh,
					a08,
					b08,
					c08,
					d08,
					A2(_sanichi$elm_md5$MD5$iget, k + 5, x),
					s31,
					4294588738);
				var d09 = A7(
					_sanichi$elm_md5$MD5$hh,
					d08,
					a09,
					b08,
					c08,
					A2(_sanichi$elm_md5$MD5$iget, k + 8, x),
					s32,
					2272392833);
				var c09 = A7(
					_sanichi$elm_md5$MD5$hh,
					c08,
					d09,
					a09,
					b08,
					A2(_sanichi$elm_md5$MD5$iget, k + 11, x),
					s33,
					1839030562);
				var b09 = A7(
					_sanichi$elm_md5$MD5$hh,
					b08,
					c09,
					d09,
					a09,
					A2(_sanichi$elm_md5$MD5$iget, k + 14, x),
					s34,
					4259657740);
				var a10 = A7(
					_sanichi$elm_md5$MD5$hh,
					a09,
					b09,
					c09,
					d09,
					A2(_sanichi$elm_md5$MD5$iget, k + 1, x),
					s31,
					2763975236);
				var d10 = A7(
					_sanichi$elm_md5$MD5$hh,
					d09,
					a10,
					b09,
					c09,
					A2(_sanichi$elm_md5$MD5$iget, k + 4, x),
					s32,
					1272893353);
				var c10 = A7(
					_sanichi$elm_md5$MD5$hh,
					c09,
					d10,
					a10,
					b09,
					A2(_sanichi$elm_md5$MD5$iget, k + 7, x),
					s33,
					4139469664);
				var b10 = A7(
					_sanichi$elm_md5$MD5$hh,
					b09,
					c10,
					d10,
					a10,
					A2(_sanichi$elm_md5$MD5$iget, k + 10, x),
					s34,
					3200236656);
				var a11 = A7(
					_sanichi$elm_md5$MD5$hh,
					a10,
					b10,
					c10,
					d10,
					A2(_sanichi$elm_md5$MD5$iget, k + 13, x),
					s31,
					681279174);
				var d11 = A7(
					_sanichi$elm_md5$MD5$hh,
					d10,
					a11,
					b10,
					c10,
					A2(_sanichi$elm_md5$MD5$iget, k + 0, x),
					s32,
					3936430074);
				var c11 = A7(
					_sanichi$elm_md5$MD5$hh,
					c10,
					d11,
					a11,
					b10,
					A2(_sanichi$elm_md5$MD5$iget, k + 3, x),
					s33,
					3572445317);
				var b11 = A7(
					_sanichi$elm_md5$MD5$hh,
					b10,
					c11,
					d11,
					a11,
					A2(_sanichi$elm_md5$MD5$iget, k + 6, x),
					s34,
					76029189);
				var a12 = A7(
					_sanichi$elm_md5$MD5$hh,
					a11,
					b11,
					c11,
					d11,
					A2(_sanichi$elm_md5$MD5$iget, k + 9, x),
					s31,
					3654602809);
				var d12 = A7(
					_sanichi$elm_md5$MD5$hh,
					d11,
					a12,
					b11,
					c11,
					A2(_sanichi$elm_md5$MD5$iget, k + 12, x),
					s32,
					3873151461);
				var c12 = A7(
					_sanichi$elm_md5$MD5$hh,
					c11,
					d12,
					a12,
					b11,
					A2(_sanichi$elm_md5$MD5$iget, k + 15, x),
					s33,
					530742520);
				var b12 = A7(
					_sanichi$elm_md5$MD5$hh,
					b11,
					c12,
					d12,
					a12,
					A2(_sanichi$elm_md5$MD5$iget, k + 2, x),
					s34,
					3299628645);
				var a13 = A7(
					_sanichi$elm_md5$MD5$ii,
					a12,
					b12,
					c12,
					d12,
					A2(_sanichi$elm_md5$MD5$iget, k + 0, x),
					s41,
					4096336452);
				var d13 = A7(
					_sanichi$elm_md5$MD5$ii,
					d12,
					a13,
					b12,
					c12,
					A2(_sanichi$elm_md5$MD5$iget, k + 7, x),
					s42,
					1126891415);
				var c13 = A7(
					_sanichi$elm_md5$MD5$ii,
					c12,
					d13,
					a13,
					b12,
					A2(_sanichi$elm_md5$MD5$iget, k + 14, x),
					s43,
					2878612391);
				var b13 = A7(
					_sanichi$elm_md5$MD5$ii,
					b12,
					c13,
					d13,
					a13,
					A2(_sanichi$elm_md5$MD5$iget, k + 5, x),
					s44,
					4237533241);
				var a14 = A7(
					_sanichi$elm_md5$MD5$ii,
					a13,
					b13,
					c13,
					d13,
					A2(_sanichi$elm_md5$MD5$iget, k + 12, x),
					s41,
					1700485571);
				var d14 = A7(
					_sanichi$elm_md5$MD5$ii,
					d13,
					a14,
					b13,
					c13,
					A2(_sanichi$elm_md5$MD5$iget, k + 3, x),
					s42,
					2399980690);
				var c14 = A7(
					_sanichi$elm_md5$MD5$ii,
					c13,
					d14,
					a14,
					b13,
					A2(_sanichi$elm_md5$MD5$iget, k + 10, x),
					s43,
					4293915773);
				var b14 = A7(
					_sanichi$elm_md5$MD5$ii,
					b13,
					c14,
					d14,
					a14,
					A2(_sanichi$elm_md5$MD5$iget, k + 1, x),
					s44,
					2240044497);
				var a15 = A7(
					_sanichi$elm_md5$MD5$ii,
					a14,
					b14,
					c14,
					d14,
					A2(_sanichi$elm_md5$MD5$iget, k + 8, x),
					s41,
					1873313359);
				var d15 = A7(
					_sanichi$elm_md5$MD5$ii,
					d14,
					a15,
					b14,
					c14,
					A2(_sanichi$elm_md5$MD5$iget, k + 15, x),
					s42,
					4264355552);
				var c15 = A7(
					_sanichi$elm_md5$MD5$ii,
					c14,
					d15,
					a15,
					b14,
					A2(_sanichi$elm_md5$MD5$iget, k + 6, x),
					s43,
					2734768916);
				var b15 = A7(
					_sanichi$elm_md5$MD5$ii,
					b14,
					c15,
					d15,
					a15,
					A2(_sanichi$elm_md5$MD5$iget, k + 13, x),
					s44,
					1309151649);
				var a16 = A7(
					_sanichi$elm_md5$MD5$ii,
					a15,
					b15,
					c15,
					d15,
					A2(_sanichi$elm_md5$MD5$iget, k + 4, x),
					s41,
					4149444226);
				var d16 = A7(
					_sanichi$elm_md5$MD5$ii,
					d15,
					a16,
					b15,
					c15,
					A2(_sanichi$elm_md5$MD5$iget, k + 11, x),
					s42,
					3174756917);
				var d17 = A2(_sanichi$elm_md5$MD5$addUnsigned, d00, d16);
				var c16 = A7(
					_sanichi$elm_md5$MD5$ii,
					c15,
					d16,
					a16,
					b15,
					A2(_sanichi$elm_md5$MD5$iget, k + 2, x),
					s43,
					718787259);
				var c17 = A2(_sanichi$elm_md5$MD5$addUnsigned, c00, c16);
				var b16 = A7(
					_sanichi$elm_md5$MD5$ii,
					b15,
					c16,
					d16,
					a16,
					A2(_sanichi$elm_md5$MD5$iget, k + 9, x),
					s44,
					3951481745);
				var b17 = A2(_sanichi$elm_md5$MD5$addUnsigned, b00, b16);
				var a17 = A2(_sanichi$elm_md5$MD5$addUnsigned, a00, a16);
				var _v12 = x,
					_v13 = k + 16,
					_v14 = {ctor: '_Tuple4', _0: a17, _1: b17, _2: c17, _3: d17};
				x = _v12;
				k = _v13;
				_p3 = _v14;
				continue hex_;
			}
		}
	});
var _sanichi$elm_md5$MD5$hex = function (string) {
	var x = _sanichi$elm_md5$MD5$convertToWordArray(
		_sanichi$elm_md5$MD5$utf8Encode(string));
	var _p9 = A3(
		_sanichi$elm_md5$MD5$hex_,
		x,
		0,
		{ctor: '_Tuple4', _0: 1732584193, _1: 4023233417, _2: 2562383102, _3: 271733878});
	var a = _p9._0;
	var b = _p9._1;
	var c = _p9._2;
	var d = _p9._3;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_sanichi$elm_md5$MD5$wordToHex(a),
		A2(
			_elm_lang$core$Basics_ops['++'],
			_sanichi$elm_md5$MD5$wordToHex(b),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_sanichi$elm_md5$MD5$wordToHex(c),
				_sanichi$elm_md5$MD5$wordToHex(d))));
};

var _user$project$Inputs$problemInputs = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: 'R3, L2, L2, R4, L1, R2, R3, R4, L2, R4, L2, L5, L1, R5, R2, R2, L1, R4, R1, L5, L3, R4, R3, R1, L1, L5, L4, L2, R5, L3, L4, R3, R1, L3, R1, L3, R3, L4, R2, R5, L190, R2, L3, R47, R4, L3, R78, L1, R3, R190, R4, L3, R4, R2, R5, R3, R4, R3, L1, L4, R3, L4, R1, L4, L5, R3, L3, L4, R1, R2, L4, L3, R3, R3, L2, L5, R1, L4, L1, R5, L5, R1, R5, L4, R2, L2, R1, L5, L4, R4, R4, R3, R2, R3, L1, R4, R5, L2, L5, L4, L1, R4, L4, R4, L4, R1, R5, L1, R1, L5, R5, R1, R1, L3, L1, R4, L1, L4, L4, L3, R1, R4, R1, R1, R2, L5, L2, R4, L1, R3, L5, L2, R5, L4, R5, L5, R3, R4, L3, L3, L2, R2, L5, L5, R3, R4, R3, R4, R3, R1',
		_1: {
			ctor: '::',
			_0: 'DULUDRDDDRLUDURUUULRRRURDRDULRUDDUDRULUDDUDRLDULRRLRDRUDUUULUUDLRURDUDDDDRDLLLLULRDLDRDLRLULRUURDDUULUDLRURRDDRDDRDDLDRDLLUURDRUULRRURURRDLRLLLUDULULULULUDRLLRUDUURLDRLRLRDRRDRLLLDURRDULDURDDRLURRDURLRRRLDLLLDRUUURLRDLDLLLLRDURRLDLULRLDDLDLURLRRDDRUDDUULRURRUDLRDLDUURDDDDRLRURUDULUDLRRLLLLLRDRURLLDLDULUUDLUDDDRLLDRRUDLLURRUUDDRRLLRRLDDDURLDRDRLURRRRDRRRDDUDULULDURRUUURRRDULUUUDDRULDRLLRDLDURLURRLLRUUUULRDURLLDDRLLDLRLRULUUDRURUDLLURUDDRDURLRDRRRDURLDDRDRLRLLURULUUULUDDDULDLRDDDRDLLRRLDRDULLUUUDLDDLDDDLLLLLLLDUDURURDURDRUURRRDDRDUDLULDURDUDURDDDRULDURURURRLURLURLUURLULDLLRUULURDDRLRDDLRDLRRR\nLUURLRUDRRUDLLDLUDDURULURLUUDUUDDRLUULRDUDDUULDUUDRURDDRRDRLULLRDRDLRLLUURRUULRLDRULUDLDUUDDDRDDLRDLULDRLDUULDLRDLLLDLDLRDUULUDURRULLRLDUDRLLLULUUUULUUDUUURRRDULLUURUDRRLDURRUULDRDULDUDRDUUULUUDDRLUDRLDLDRUUURDLDUDRUDUURLLRRLRLLRRLDULDDULUDUUURULDDUDUDRURRDLULRUDDURDLDLLRRRLDRLULLLRUULDUDLUUDURRLLLRLUDURRDDLDRDDDLURDLDRRUDUDLUDULULRUUUDLUURLLRLDDLURULDURDLRRDDDDURLDDLLDDULLLRLDLDULDUUDDRLDUURDDLDLUUDULRRLRLUURURUURLRLURUURLDRUURLLRDDUUUDULUDDDRDRLDRDRRLRLDULLRRUDLURULULRDRURURLULDUDLRURLRDDRULDDLRD\nLUDRULUULRRDDDDRRDUURUDDRLDDLDRDURRURULRDLDLDUUDRRDUUDUDLLLRRLDUDDRLDDLRRLRDRLUDLULUDDUUDULDUUULUDLDDURLDURUDLDRUUDRLRRLDLDDULDUUDDLDDLLURDRLRUURDDRUDDUDLDRRLRUDRUULRRRLRULULURDLRRURDRLRULDDDRDUULLURUUUURUDDLRRRRRDURLULDLUULUDRRUDUDRRDDRURDURLRLUDDLDLRRULUDLDDRLDDLDDDLLLLRDLLUULDDLULDLDRDDUDLURUDLDLDDRRUUDDDLRLLLDRRDDDUURDUDURUURRDRLLDUDLDUULLDLDLLUULLRRULDLDRURLDULDRUURDURRURDLRDLLLDRRUDRUUDRURLUDDRURLDURRDLUUDLUUDULLLDDDDRRDLLLDLURULDDRDLUUURRDRRUUDDUL\nDUUULDUDDDURLLULDDLLUDURLLLURULULURUURDRURLRULLLLDRDDULRRDRRLLLRDDDUULLRRURRULLDDURRRLRDDLULDULLDUDLURRDLDDLURDLRLLDRURLLRLLRRRDRRRURURUUDDLLDDLDDDLRLURUUUULRDLUDDDURLLDDRLDRRLLUDUUULRLLDRRRLRUUDLDUULRLUDRULLLLDUDLLUUDDRUURLURUDRDDDLRURUDRLULLULUUDLDURDULRRDRLDURUULRDRRRDRDRRLRLRDDUULLRDLDURDDDULURRLULDDURDURDDUDURDLLUUULUDULRDDLDRDRUDLLUURDLRDURURULURULLDRLLRRULDLULULDLULRURLRRLUDLLLRLUDLURLULDULDRLLLDLDDDDRDRLRRLRDULUUDULDDLDURDLLLDDDDLLUURRDURLDLUDDLULRUUUDDRRLDLLLRDLLDRRRDDLULLURDDRRRRLDLRLLLRL\nLULLRRDURRLDUUDRRURLURURRRLRDRUULUULURLLURRDRULRDURDDDDUULLLLDUULDLULURDRLDLULULDRLLDLLRLRULURUDRUUDULRULLLUDRULUDRLLUDLDRRDRUUURURLRDURDRLRDDDURLURRDLRUUUDUURULULDLUULRDLRRRDRDRLLLDLRRDRLLDDULDRUDRRLULLRDLDUDDULRDDLULRURULRLLLULDLLLLRDLDRURUDUURURLDRLUULLDUDULUDDDULUDLRUDDUDLULLUULUUURULURRULRDDURDDLURLRRDRDLDULRLRDRRRULRDDDRLLDDDDRRRRDRDLULUURDURULDLRDULDUDLDURUDLUDLUDDDUDURDURDDURLLRUDUURRRUDRRRRULLLLDDDLUULLUULRRRULDLURDLULRULDRLR',
			_1: {
				ctor: '::',
				_0: '810  679   10\n  783  255  616\n  545  626  626\n   84  910  149\n  607  425  901\n  556  616  883\n  938  900  621\n  638  749  188\n  981  415  634\n  680  557  571\n  523  604  270\n  910  954  484\n  464  392  514\n  458   52  687\n  696  438  832\n  213  583  966\n  572  571  922\n  451   42  686\n  177  390  688\n  151  136  705\n   92  413  191\n  789  676  377\n  486  262  600\n  450  708  472\n  556    9  481\n  157   85   94\n  574   93  549\n  539  165  487\n  815  742   73\n  353  773  428\n  526  152  680\n  433  711  557\n  168  632  306\n  848  992  757\n  885  786  890\n  469  475  146\n  899  833  137\n  864  202  688\n  101  902  620\n  529  937  826\n   41  381  521\n  562  883  804\n  468  197  272\n  451    8  420\n  561  193  630\n  597  951  383\n  171  845  251\n  541  810  157\n  268   46  712\n  332    2  397\n  100   47  436\n  194  665  205\n  325  277   21\n  170  652  205\n  765  165  506\n   15  257  144\n  762  124  401\n  662  543  531\n   29  425  308\n  667  785  299\n  935  758  405\n  504  998  367\n  771  947  630\n  490  933  978\n  441  498  896\n  862  896  607\n  655  935  194\n  286  240  324\n  368  723  311\n  419  762  600\n  316  903  529\n  197  215  215\n  551  461   77\n  855  318    7\n  894  690   86\n  451  648  416\n  608  132  385\n  420  761  112\n  560  711  195\n  371  750  506\n  188  307  584\n   26  377  622\n  304  701  292\n  286  630  642\n  883  880  379\n  774  564  597\n  300  692  701\n  529  595   27\n  740   76  445\n  567  648  422\n  340  163  901\n  374  775  902\n  308  827  882\n  529  371  374\n  996  587  162\n  534  360  516\n  924  160  276\n  724  896  687\n  929  971  578\n  798  252  761\n  512  991  812\n  465  758   49\n  724  446  571\n  482  196  544\n  553  247   86\n  624  552  778\n   73  143  127\n  556  471  749\n  224  927  383\n  133  636  847\n  174  985  569\n  572  819  881\n  282  818  383\n  535  429  780\n  953  540  815\n  577  302  494\n  530  654  370\n  670  739  168\n  700  695  806\n  196   48  928\n  255  805  749\n   65   96  969\n  292  860  929\n  556  269  297\n   43  832  407\n  542  723  438\n  919  139  407\n  709  194  955\n  847  237  933\n  321   41  216\n  778  749  374\n  782  745  529\n  716  572  251\n   90   49  976\n  639  557  740\n  148  125  784\n  143  819  382\n   71  729  563\n  309  500  806\n   25  412  594\n  296  600  237\n  681  187  142\n  758  913  288\n  163  972  266\n  197  352  190\n  383  190  562\n  206  214  393\n  566  307  294\n    2  284  335\n  564  472  394\n  635  928  589\n  169  744  574\n  710  386  589\n  970  386  827\n  943  424  134\n  846  269  712\n  266  765  615\n  344  824  685\n  250  222  554\n  377  586  859\n  398  526  275\n  317  996  937\n  503  364  389\n  212  782  533\n  584  539  589\n  731  200  584\n  773  389  578\n   43  482  104\n  432  140  339\n  193  758  673\n  612  882  582\n  314  920  130\n  522   40   26\n  695  939  149\n  955  121  552\n  728  850  661\n  524  766  433\n  817  221  992\n  753  580  543\n   72  392  873\n  445  897    3\n  144  508  567\n  354  990  566\n  477  392  687\n  602  846  520\n  321  577  677\n  716  518   55\n  367   77  545\n  361  473  504\n   98  893  887\n  854  920  887\n  860  174   30\n  389  857  797\n  686  968  907\n  613  275  595\n  855  440  906\n  749  494  735\n  527  895  550\n  767  971  488\n  118  814  148\n  854  193  480\n  847  425  378\n  697  159  357\n  282  476   48\n   96  314  176\n  949  597  903\n  956  478  885\n  714  754  278\n  757  547  210\n   53  223  170\n  355  725  928\n  930  780  762\n  924  581  266\n  570  132  283\n  625  674  529\n  159  719  325\n  316  670  929\n   55  655  542\n  344   19  791\n  437  805  312\n  327  867  647\n  521  405  496\n  383   58  117\n  638   36  175\n  924   59  112\n  401   66  353\n  740  785  823\n  713  725  622\n  821  702  246\n  378   24  958\n  690  718  924\n  486  788  537\n  377  214  670\n  514  720  427\n  451  927  877\n  808  868  872\n  554   94    2\n  534  516  715\n  735  318  125\n  880  496  755\n  724  115  567\n   23  105   89\n  725   55  561\n  599   44  581\n  378  661  173\n  628  640  632\n  747  817  448\n  557  248  338\n  743  833  776\n  309  895  759\n   18  696  851\n  328  775  356\n  220   37  499\n  865  390  651\n  736  397  205\n  645  949  170\n  638  860  143\n   23  262   98\n  822   46  842\n  663  687  860\n  941  700  745\n  762  304  509\n  154  275  369\n  728  155  324\n   99  113  485\n  245   82   62\n  294   76  484\n  215  664  398\n  146  336  461\n  102  591  503\n  535  814  749\n  250  410  892\n  672  467  212\n  304  108  285\n  300  246   11\n    4  304  284\n  115  132  112\n  460  334  739\n  453  281  792\n  505  591    6\n  482  413  975\n   26  763  980\n  226  377  727\n  406   59   39\n  570  325  691\n  333  438  966\n  267  792  229\n  130  384  854\n  375  165  187\n   37  498  403\n  357  509  242\n  710  796  296\n  708  187  265\n   46  762  279\n   84  589  760\n  578   38  226\n  624  558  570\n  338  517  276\n  547  498  648\n  626  265  677\n  144  662  193\n  581  820  407\n  477  567  232\n  582  890  926\n  167  458  502\n  635  841  607\n  505  346  239\n  522  970  506\n  608  830  686\n  100   89  353\n   95  159  652\n   24  163  786\n  328  313  534\n  793   52  249\n  750  274  683\n  885  463  247\n  534  326  391\n  938  726  199\n  893  620  120\n  899  410  508\n  226  896  459\n  677  694  780\n  880   15  831\n  909  683  903\n   55    7  541\n  294  221  109\n  286  216  507\n  239  652  380\n  948  760  431\n  772  258  275\n  562  226  631\n  503  264  765\n  690   42  369\n  761  541  373\n  232  596   75\n  925   60  402\n  550  181   16\n  600  579  701\n   92  419  696\n   26  117  290\n    4  487  157\n   21  474  308\n   99  827  835\n  279  216  451\n  267  739  749\n  309  456  262\n  320   91  282\n   52  431  304\n  773  784  932\n  474  483  932\n  703  975  257\n  851  227  584\n   17  224  365\n  845   96  536\n  258  150  905\n  797  119  876\n  862  196  220\n  954  964  355\n  534  979  302\n  905  509  628\n  153  185  273\n  169  538  509\n   43  477  356\n  702  357  940\n  340  403  284\n  638   86  744\n  329  426  903\n  222  720  682\n  127  624  253\n   28  849  485\n  555  158  599\n  553  690  443\n  598  926  185\n  611  934  868\n  986    8  983\n  166  396  946\n  500  822  662\n  507  715  828\n  294  790  587\n  661  779  235\n  549  594  657\n  771  918  800\n  923  896  983\n  866  203  437\n  723  465  852\n  589  717  731\n  332  331  710\n  984  484  794\n  750  479  886\n  857    5  286\n  400  841   63\n  665  513  508\n  841  739  513\n  331  586  669\n  420  561  690\n  346  104   22\n  847  758  149\n  570  211  816\n  524  868  962\n  483  229  317\n  408  555  325\n  682  650  285\n  646  987  974\n  467  368  779\n  442  640  968\n  644  131  184\n  903  916  162\n  565  890   91\n  474  763  351\n  569  178  709\n  520  618  666\n  437   75  213\n  509  471  758\n  298  486  904\n  364  416  429\n  513  971  271\n  169  863  202\n   15  206  565\n  163   69  713\n  167  186  542\n  908  550   89\n  936  764  451\n  118  467  464\n   89  385  375\n  179  165  545\n  143  514  187\n  313   47  636\n  477  830  550\n  769  808  577\n   74  756  630\n  698  799  654\n  721  387   36\n  993  763  945\n  707  746    7\n  955  113  948\n  723  532  526\n  174  795  204\n  671  968  575\n  523  256  109\n  570  186  296\n  350  351  215\n  141  251   22\n  532  217  695\n  460   37  719\n  695   69  516\n   36  597  350\n  670  552  556\n  287  143   35\n  400  801   45\n  133  921   71\n  637  169  646\n  108  721  890\n  655  681  311\n  885  393  603\n  375  388  113\n  976  522  534\n   15  516  627\n  685  602  535\n  669  390  781\n  845  950  348\n  388   30  379\n  825  955   46\n  360  579  898\n  363  573  660\n   33   30  864\n  905  723  916\n  968  648  655\n  178  181  363\n  754  262  268\n  883  837   45\n  216  687  222\n  520  973  909\n  808  968  943\n  335    3  202\n  211  605  517\n   32  298  358\n  184  488  173\n  741   23  328\n  400  482  144\n  626  491  451\n  920  546  219\n  363  734  861\n  739  417  685\n  954  470  541\n  598  679  950\n  550  372  450\n  980  459  213\n  353  374  293\n  720  220  256\n  173   29  571\n  289  769  833\n  372  793  345\n  578  298  332\n  763  225  167\n  258  519  307\n  504    7  649\n  186  319  883\n  358  322  918\n  293   60  330\n  373  562  550\n  310  532  573\n  741  129  533\n  701  614  869\n   54  736  587\n  451  131  817\n  499  784  651\n  931  681  193\n  674  311  500\n  900  312  197\n  553   94  331\n    9  715  572\n  590   97  275\n  579  713  299\n   20  345  741\n  817  738  534\n  819  963  497\n  168  303  997\n  462  599  698\n  400  772  485\n  755  922  928\n  591  847  180\n  500  135  977\n  946  940  751\n  658  368  790\n  720  714  141\n  850  261  594\n  615  116  476\n  660  156  488\n  485  895  378\n  797  992  614\n  847  652  838\n  842  516  364\n  745  444  329\n  175  362   84\n  684  223  578\n   43  291  394\n  702  222  862\n  208  247  494\n  601  236  234\n  780   53  675\n  754  135  126\n   26  776   52\n  735  716  136\n  591  829  171\n  606  373  824\n   51  926  766\n  273  161  558\n  215  557  149\n  393  703  653\n  318  208  207\n  891   54  570\n  790  153  689\n  521  693  423\n  559  986  542\n   58  611  404\n  178  509  602\n  684  120  975\n  791  407  811\n   94  321   66\n   14  317  266\n  108   14  271\n  580  454  391\n  781   82  849\n  419  406  775\n  396  298  237\n  448  375  330\n  747  301  322\n  103  835  120\n  138  897  630\n  127  102  546\n  518  552  412\n  398  442   43\n  586  972  380\n   30  535   91\n   42  384  962\n   61  414  942\n  610  147   65\n  945  155  418\n  667   54  375\n  473  251  187\n  440  222  124\n  886  158  163\n  862  493  149\n  805  451  536\n   59  108  458\n  663  613  719\n  264  525  574\n  755  176  168\n  390    6  783\n   50  561  233\n  401  568  582\n  121  979  769\n   94   77  830\n  195  938  201\n  124  626  161\n  668  633   35\n  662   29  164\n  394  658  768\n  203  918  850\n  466  425  399\n  353  804  714\n  323  851  640\n  152  939  642\n   29  309  484\n  579  529  822\n  608  262  731\n   38  756  450\n  433  828  740\n  431  895  693\n  392  477  399\n   25  925  513\n  368  969  491\n  671  736  911\n  307  198  660\n  662  859  311\n  853  596  526\n  917   24  461\n  677  574  960\n  697  220   90\n  203  458  102\n  499  284   29\n  400   79  582\n  484  195  597\n  575  276  912\n  493  269  347\n   23  593  223\n  476  802  358\n   33  944  255\n  715  117  460\n  739  885  586\n  748  954  527\n  734  773  643\n  542  202  117\n   15  976  460\n  309  830  331\n  319  208  557\n  458  822  461\n  545  784  690\n  878  372  858\n   57  295  470\n  268  537  822\n  271  301  699\n  806  909  878\n  744  182  571\n  106  895  468\n  121  778   28\n  641  202  593\n  710  724  592\n  125  784  603\n  654  771   83\n  721   87  543\n  585  724   89\n  381  739  524\n  623   28  494\n  869  729  292\n  228  736  298\n  803   10   95\n  700  224  786\n  738  512    9\n  708  407  775\n  558  645  863\n   45  209  466\n  540  809  587\n  372  512  717\n  416  203  974\n  272  496  928\n  816  141  903\n  675  894   84\n  567  900  957\n  827  122  189\n  882  860   56\n   98  792  196\n  861  461  209\n  685  339   87\n  585  464  235\n  640  156  703\n  817  596  321\n  893  462  996\n  679  536  208\n  199  455  365\n  873  260  492\n  528  179  563\n  689  563  849\n  887  417  507\n   64  270  198\n  595  214  166\n  566  232  242\n  921  102  212\n  187  202  335\n  992  169  475\n  736  754  200\n  655  374  127\n   84  492  193\n   21  709  972\n  199  208  236\n  216  683  926\n  479  669  604\n  437  872  293\n  789  256  515\n  341  948  637\n  142  933  536\n  207   82  218\n  702  249  779\n  253  369  874\n  508  255  254\n   91  536  541\n  212  813   28\n  144  406  563\n  180  513  277\n  421  842  639\n  570  520  522\n  224  830  592\n  153  582  606\n   81  415  239\n  160  553  735\n  525  348  778\n  454  352  626\n  609  460  169\n  559   57  334\n  784  428  242\n  706  867  289\n  637  914  281\n  620  407   83\n  152  446   90\n  260  331  799\n  301  677  725\n  708  254  328\n  418  147  798\n  732  344  963\n  627  626  302\n  670  241   76\n  220  383  376\n  733  124   50\n  795  673  466\n  136  637  423\n  823  258  700\n  204  936  878\n  730  976  981\n  272  310  894\n  333  201  863\n   90  122  621\n   90  811  209\n  275  904  283\n  193  125  189\n  127  961  283\n  347  529  829\n  352  738  734\n  878  726  411\n  942   54   34\n  429  750  426\n  367  938  424\n  501  447  757\n  566  773  648\n  382  140  899\n  462  353   90\n  230  493  945\n  425  290  415\n  894  360   21\n  897  529  431\n  914  124  338\n   78  766  876\n  858  664  764\n  598  664  317\n  630  548  772\n   30  483  604\n  642  331  545\n  518  702  474\n  546  750  887\n  252  663  547\n  813  917  671\n  852  367  894\n   97  192  265\n  661  587  858\n  726  674  748\n  578  178  878\n  327  535  608\n  426  419  871\n  559  837  229\n  851  721  708\n  860  978  770\n  308  604  626\n  198  168  408\n  138  628  799\n  669  525  918\n  804  762  652\n  389  429  554\n  618  566  360\n  814  648  887\n  677  697  659\n  600  660  162\n  256  749  195\n  840  734  216\n  445  192  960\n  341  226  975\n  699  140  114\n  763  833  533\n  234  835   38\n  798   10  569\n  190  745  418\n  183  563  486\n  295  224  197\n  437  724  885\n  197  706  328\n  268  709  702\n  351  679  694\n  642  555  769\n  333  521  883\n  182  532  772\n  517  543  711\n  657  154  169\n  134  888  300\n  217  121  209\n  346  796  100\n  755  681  817\n  277  733  980\n  677  162  481\n  527  191  433\n  293  999  653\n  429  850  503\n  562  205  402\n  217  323  414\n  565  402   43\n  730  223  537\n    4  701  567\n  737  570  523\n  644  510  459\n  390  252  367\n  344  715  179\n   62  236  586\n  527  310  137\n  526   96  548\n  585  357  407\n  768  532  384\n  591  421   43\n  928  129  533\n  228  469  848\n  886  349  596\n  392  231  867\n  507  664  870\n  546  881  121\n   28  306  275\n  688  284  261\n  683  495   31\n  733  191  899\n   83  785  730\n  738  668  220\n  795   69  237\n  148  175  238\n  872  139  100\n  673  671  744\n  222  421  346\n  824  971  589\n  283  135  474\n  626   48  487\n  426  172  548\n  796  463  616\n  547  349  568\n  717  798  428\n  248  977  192\n  337  683  128\n  480  487  231\n  817  559  882\n  413  935  879\n  694  724  447\n  221  458  449\n  649  523  725\n  689  131  311\n  726  707  273\n  712  689  127\n   65  338  183\n  612  523  679\n  631  834  297\n  701  320  433\n  265  518  602\n  691  519  160\n  463    4  575\n  777  590  394\n  790  975  201\n   22  449  242\n  578  308  911\n  371  157  191\n  489  263  789\n  962  696  390\n  494  760  494\n  760  656  350\n   57  322  551\n  639  105  616\n  676  402  236\n  269  464  893\n  265  573  312\n  472  822  682\n  410  385  584\n  882   56  493\n  596  330  827\n  184  494  873\n   61  580  793\n  157  260  128\n  440  239  390\n  701  174  230\n  946  357  394\n  273  423  258\n  529  438  733\n  552   75  892\n  946  755  996\n   64  836  112\n  971  192  928\n  188  378  692\n  179  299  676\n   91  177  202\n  748  644  634\n  551  355  345\n  265  504  410\n  644   58  450\n  103  716  556\n  691  679  128\n  166  255  174\n  415  682  368\n  474  862  434\n  348  462  133\n  704  626  374\n  979  835  426\n  239  897  288\n  381  953  234\n  181   65  504\n   61  803  297\n  761   22  946\n  771  822  908\n  900  914  563\n  656  948  114\n  349  202  594\n  322  294  811\n  535  484  837\n  532  438  869\n  700   94  814\n  691  557  159\n  201  512  738\n  598  652  742\n  269  642  772\n  698   23   49\n  376  375  689\n  375  476  819\n  426  421  559\n  683  775  420\n  876  374  995\n  281  556  587\n  990  137  273\n  782  928  299\n  895  829   65\n  228  687  764\n   62  496  905\n  210  277  352\n  732  461  535\n  418  364  561\n  958  373  189\n  640  617   27\n  185  680  698\n  697  507  688\n  324  836  143\n  434  868  658\n  342  516  628\n  351  760  280\n  796  663  876\n  977  133  813\n  169  326  101\n  139  575  796\n  236  597  851\n  191  704  375\n  568  733  436\n  615   68  728\n  478  768  617\n  531  594  596\n  898  898   64\n  596  181  707\n  371  381  259\n  609  406  528\n  810  271  308\n  211  975  596\n  963  896  551\n   94  362  418\n  812  351  848\n  732  495  708\n  866  246  209\n  973  682  792\n  898  535  672\n  667  237  783\n  325  642  229\n  419  654  754\n  328  374    7\n  359  468   93\n   91  453   93\n  923  741   53\n  721  938  589\n  235  716  605\n  466  387  199\n  554  430  681\n  166  181  864\n  699  998  953\n  999  962  718\n  330  124  822\n  443  536  930\n  293  631  674\n  197  574  315\n  407  183  293\n  432  417  537\n   31  571  657\n  901  555  463\n  686  456  465\n  217  259    3\n  742  535  427\n  881  347  555\n  769  659  299\n  134  577   20\n  252  566  877\n  181   10  885\n  191  829  994\n  744  649  867\n  910  354  781\n   68  767  930\n   88  716  850\n   22  290  121\n  226  212  666\n  266  327  812\n  356  112  148\n  252  397  741\n  325  674  834\n  389  442  946\n  898   83  618\n   51  807  862\n  844  772  461\n  831  546  467\n  644  476  539\n  758  758  722\n  346  512  463\n  157  427  697\n  439  672  243\n  192  869  150\n  890  977  753\n  962  767  607\n  818  926  500\n  960  927  219\n  377    9  389\n  661  191  869\n  695  149  368\n  358  342  778\n  474  396  202\n  546  585  853\n   74  281  734\n  830  295  611\n   19  813  388\n  847  963  378\n   78  140  278\n  531  580  246\n  550  546  415\n  739  419  197\n  803  266  247\n  285  672  123\n  669   51  665\n  525  662    5\n  998  619  667\n  737  368  910\n  533  550  245\n  899  667  932\n   80  302  566\n  508    1  576\n  454  303   15\n  752  463  159\n  119  380  906\n  702  279  942\n  234  198  326\n  262  207  305\n  214  388   64\n  975  779  523\n  975  243  519\n  694  895   79\n  750  477  112\n  746  470  108\n  201  299  119\n  748  890  652\n  808  897  387\n  908  617  466\n  739  750  302\n  887  765  558\n  464   97  662\n   11  745  109\n  454  537   27\n  446  363  118\n  265   33  670\n  862  497  147\n  681  488  582\n  370  131  389\n  645  652  560\n  496  548  779\n  910  434  642\n  793  105  303\n  232  468  916\n  932    5  657\n  782  634  626\n  429  642  326\n  946  618  408\n  760  711  553\n  561  391  385\n  614  834  961\n  585  853  375\n  188  562  635\n  775  758  496\n  300  128  476\n  747  817  333\n  288  608  259\n  410  883  700\n  142  691  562\n  222  270  870\n  654  341  896\n  548  133  474\n   49  712  796\n  486  607  561\n  483  920  970\n  510  553  658\n  876  682  369\n  654  744  670\n  508  888  671\n  648  111  694\n  213  954  529\n  548  879  258\n  342   15  155\n  265  880  313\n  613   36  583\n  285  774  605\n  696  776  742\n  772  230  561\n  239  304  710\n  602  387  940\n  871  107  512\n  182  321  376\n  927  392  527\n  677  124  195\n  312  270  938\n  755  308  986\n  400  779  601\n  876  843  690\n  964  719  119\n  925  665  237\n  730  719  310\n  352   86  123\n  583  801  629\n  697  340  198\n  150  635  446\n  905  183  133\n  648  654  298\n  445  743  383\n  483  628  344\n  460  822   64\n  264  872  384\n  496  291  691\n  130  742  608\n  491  590  986\n  737  317  602\n  442  179  684\n  617  256  642\n  711  688  915\n  679  804   29\n  127  869  890\n  621  677  347\n  306  486  533\n  645  198  481\n  706  855  997\n  686  743  117\n  152  947  939\n  271  251  352\n  324  621   83\n  562  745  349\n  901  797  273\n    7   84  696\n  895  857  751\n  692  663  805\n  692  489  122\n  876  848  930\n  667  851  155\n  226  218  502\n  447  876  635\n  395   40  430\n  652  999  312\n  362  992  135\n  714  360  668\n  603  393  858\n  176   36  470\n  956  803  884\n  678  829  391\n  340  128  810\n  643  777  545\n   71  314  335\n  705  667  881\n  119  708  664\n  480  524  560\n  432  183  165\n  983  946  881\n  788  472  442\n  386  767  510\n  864  823  566\n  764  684  955\n  155  309  725\n  459  300  826\n  627   85  796\n  497  376  448\n  827  969  784\n  408  875  120\n  764  883  698\n   81  590  675\n  128  549  653\n  127  606  712\n  668  989  706\n  776  440  615\n  121  840  169\n  641  648  803\n  224  671  825\n  733  419  107\n   86  208  359\n  383  809  426\n  322  741  122\n  772   75  577\n  844  100  782\n  128  139  344\n  702  420  230\n  311  488  724\n  633  209  661\n   33  564  249\n  459  120  886\n  493  473  761\n  252  719  939\n  506  628  748\n  673  843  501\n  124   54  798\n  421  761  726\n  521  732   70\n  395  438  839\n  600  434  851\n  464  374   29\n  598  900  349\n  817  637  266\n  558  625  311\n  503  806  254\n  527  415  447\n  131  972  675\n  816   36  481\n  870  880  637\n  215  908  266\n  973   18  622\n  973  940  514\n  463  923  875\n  472  982  282\n  868  808  269\n  544  272  456\n  961  836   90\n  130  888  215\n  974  276  275\n  309  233  253\n  973   46  438\n  842  277  438\n  366   80  179\n  419  901  846\n   82  907  966\n  596  354  513\n  381  362  490\n  846   11  884\n   22  718  970\n  396  766  862\n  397   62  598\n  222  158  646\n  814  712  225\n  732  629  623\n  809  626  692\n  979  632  811\n  503  139  372\n  462  517  811\n  256  899  609\n  216  570  483\n  902  733  385\n   89  928    4\n  887  695  386\n   35  568  155\n  781   58  203\n  775  604  291\n  367  692  689\n  101  158  677\n  336  580  368\n  981  337  174\n  900  880  593\n  275  613  463\n  311  907  363\n  368   83  832\n   64  974  980\n  157  562  421\n   12  820  590\n  160  464  322\n  245  444  382\n    9  312  134\n  257  306  288\n  237  449  297\n  142  600  661\n  320  363  821\n  721   84   89\n  589  509  116\n  413  594  181\n  890  477  712\n  742   65  245\n  229  432  917\n  536  189  821\n  732  401  407\n  515  210  512\n  733  778    2\n  852  451  210\n  130  360  208\n  230  408  748\n  667  499   94\n  467  112  789\n  649  764  715\n  253  908   53\n  775  878  673\n  265    5   24\n  717  434   72\n  687  428   72\n  268  436  903\n  678  450  742\n  636   40  792\n  555  104  649\n  538  608  340\n  370  525  847\n  555  830  585\n  763   92  375\n  754  898  314\n  153  560  139\n  224  663  666\n  138  344  595\n  278  448  532\n  413  492  470\n  432   98  335\n  148  795  903\n  729  903  101\n  818  186  960\n  853  631  290\n  761  170  666\n  171  582  732\n  189  731  633\n  779   20  287\n  883  726  449\n  701  139  747\n  571   29  567\n  918  166  232\n   98  356  853\n  815  512  449\n  911  504  671\n  728  414  257\n  515  517  657\n  590  854  517\n  388  526  831\n  646  217  989\n  845  355  289\n  573  306  156\n  563   11  456\n  107  320  601\n   37  287  714\n  167  290  958\n  198   37  287\n  896  491  695\n  712  282  239\n  223  252  604\n  524  955  584\n  883  890  665\n  818  817  242\n  518  236  632\n  410  222  191\n  310  135  666\n  983  634  348\n  671  476  306\n  986  665  111\n  109  220  399\n  717  738  695\n  764  825  534\n  616  315  977\n  628  142  873\n   19  287  155\n  967  255  868\n  191   80  844\n  986  220  988\n  419  521  444\n  454  916  489\n   71  859  500\n  897  459  731\n  823  791  216\n  351  677  556\n  840  208  612\n  983  156   22\n  988  318  633\n  472  628  495\n  341  608  343\n  771  779  528\n  818  149  422\n  598   52  436\n  678  130  285\n  455  502  177\n  461  245   81\n  466  382  258\n  181  661   64\n  808  499   22\n  892  243   76\n  341  643  531\n  717  328  856\n  811  779  683\n  666  220  797\n  613  453  417\n  978  632  462\n  457  620  387\n  558  681  351\n  105  337  432\n  880   55  818\n  438   63  136\n  709  100  700\n  229  792  280\n  427  985   53\n  442  385  325\n  918  328  642\n  754  291  642\n  970   74  973\n  296   55  952\n  577  458  924\n  645  507  523\n  589  149    6\n  491  933  297\n  871  822  303\n  436  938  577\n   98  762  322\n  368  875  708\n  607  636  385\n  488  362  722\n  642  379  510\n  271   30  954\n  338  296  210\n  125  279  887\n  614  178  645\n  268  237  471\n  578   60  720\n  776  691  995\n  814  565  784\n   58  358  474\n  968  573  398\n  358  613  323\n  851  694  665\n  109    4  181\n  366  741  777\n  447  747  870\n  738  460  241\n  905  694  448\n  440  901  565\n  293  278  940\n  822  276  877\n  746    2  338\n  227  915   30\n  604  733  486\n  501  359  493\n  536   79  751\n  621  623  135\n  524  547  812\n  917   11  982\n  505   55  826\n  580   55  287\n  228  805  345\n  586  101  202\n  624  829  465\n  262  645  636\n  942  775  496\n  724  942  398\n  803  499   16\n  326  565  969\n  751  977  964\n  320  725  153\n  258  772  689\n  107  421  839\n  402  399  578\n  116  927  560\n  508  685  100\n  970  581  680\n  119   98  451\n  904  580  314\n  207  186  373\n  791  286   21\n  917  199  388\n  210  549  203\n  212  270  266\n    2  429  355\n  297  647  659\n  233  537  895\n  142  284  332\n  219  237  361\n  246  247  401\n  288   81  328\n  360  346  279\n   21  262  298\n  343  211   50\n  637  778  813\n  820  240   32\n  660  781  805\n  638  470  759\n  779  198  372\n  158  392  433\n    5  274  133\n  189  346  169\n  194   74   37\n   13  767  447\n  167  546  364\n  176  618  336\n  554  638  712\n  615  663  776\n  824   62  142\n  582  320  499\n  302  278  545\n  751  296   71\n  366   35  493\n  196  657  381\n  364  685  134\n  888  756  128\n   17  799  479\n  872  685  363\n  879  279  556\n  665  164   40\n  264  418  539\n  627  575  589\n  978  792  584\n  662  693    9\n  988  838  552\n  870  299   11\n  141  674  546\n  460  912  693\n  216  795  292\n  531  699  441\n  207  795  373\n  719  461  831\n  571  491  664\n  142  282   59\n   48   89  556\n  147  278  506\n  334  990  607\n  483   42  370\n  766  978  303\n  343  336  215\n  283  745  857\n  306  587  642\n  566  764  323\n  372  267  609\n  878  505  315\n  282  877  342\n  283  369  682\n    4  823  926\n  339  831  891\n  521   33  942\n  704  816  318\n  416  621  503\n  163  684  625\n  514  141  646\n  362   81  368\n  134  819  425\n  324  768  190\n  985  309  356\n   41  491  802\n  997  793  905\n  976  684  837\n  368  954  863\n  878  407   43\n  216  662  557\n   82  425  547\n  286  486   43\n  841  595  727\n  809  169  417\n  233  566  654\n  547  419  783\n   91  422  981\n  628    1  945\n   83  747  306\n  399  806  592\n  346  708  392\n  813  865  624\n  516  636   29\n  592  753  610\n  440  460  145\n  457  457  114\n   40   19  165\n  494  659  248\n  647  950  224\n  810  965  241\n  913  630  245\n  919  652  409\n   38  151  355\n  430  239   96\n  372  597  360\n  711  494  370\n  176  710  108\n  130  230  503\n  188  509  421\n  850  394  702\n   68  744  665\n  919  923  873',
				_1: {
					ctor: '::',
					_0: 'hqcfqwydw-fbqijys-whqii-huiuqhsx-660[qhiwf]\noxjmxdfkd-pzxsbkdbo-erkq-ixyloxqlov-913[xodkb]\nbpvctixr-eaphixr-vgphh-gthtpgrw-947[smrkl]\niwcjapey-lhwopey-cnwoo-wymqeoepekj-992[eowpy]\nmvhkvbdib-agjrzm-zibdizzmdib-317[bizdm]\nexcdklvo-lkcuod-dbksxsxq-146[ztwya]\nocipgvke-ejqeqncvg-octmgvkpi-908[prmku]\nktwbhtvmbox-vetllbybxw-vtgwr-vhtmbgz-tvjnblbmbhg-579[uvnyc]\ndpmpsgvm-tdbwfohfs-ivou-tijqqjoh-389[emdac]\nforwcoqhwjs-pibbm-igsf-hsghwbu-532[bhswf]\nuzfqdzmfuazmx-nmewqf-ogefayqd-eqdhuoq-664[qfdem]\nfnjyxwrinm-yujbcrl-pajbb-uxprbcrlb-277[brjcl]\naoubshwq-dzoghwq-ufogg-fsoqeiwgwhwcb-714[nkrmy]\npbeebfvir-rtt-fnyrf-975[frbet]\nbnknqetk-qzaahs-trdq-sdrshmf-235[mtcqz]\nodiih-ljwmh-lxjcrwp-orwjwlrwp-927[wjlrh]\nsxdobxkdsyxkv-bkllsd-cobfsmoc-302[sbdko]\ngzefmnxq-omzpk-ymzmsqyqzf-352[saomt]\ntvsnigxmpi-gerhc-gsexmrk-qerekiqirx-854[eirgx]\nktfitzbgz-vtgwr-ftgtzxfxgm-267[tgfzx]\nlxuxaodu-npp-orwjwlrwp-563[pwlor]\noazegyqd-sdmpq-pkq-xmnadmfadk-352[damqk]\nwfruflnsl-gzssd-hzxytrjw-xjwanhj-177[bgxsp]\npbybeshy-qlr-qrfvta-455[tmios]\nxmrrq-udskkaxawv-vqw-esfsywewfl-918[fdqsb]\nvhehkyne-vahvhetmx-ltexl-917[uvhmy]\nmolgbzqfib-ciltbo-obzbfsfkd-393[htayl]\nveqtekmrk-jpsaiv-wlmttmrk-256[ewyhq]\ncvabijtm-lgm-apqxxqvo-512[dinjm]\noaxadrgx-nmewqf-qzsuzqqduzs-456[oevtg]\nvehmsegxmzi-veffmx-wepiw-880[emfiv]\nfruurvlyh-fubrjhqlf-fdqgb-frdwlqj-ghvljq-413[cgkzy]\notzkxtgzoutgr-inuiurgzk-sgxqkzotm-774[gtzko]\nhwbba-eqpuwogt-itcfg-tcddkv-ujkrrkpi-154[ktbcd]\npynffvsvrq-cynfgvp-tenff-ynobengbel-377[fnevy]\naoubshwq-qcbgiasf-ufors-qvcqczohs-hsqvbczcum-558[hypcz]\nkzeed-xhfajsljw-mzsy-knsfshnsl-281[nsmtd]\nhwdtljsnh-hfsid-htfynsl-ijufwyrjsy-177[hsfjy]\nexcdklvo-zvkcdsm-qbkcc-psxkxmsxq-900[yznml]\ndiozmivodjivg-xviyt-pnzm-oznodib-239[iodvz]\nnzcczdtgp-clmmte-lnbftdtetzy-743[tczde]\nejpanjwpekjwh-bhksan-iwngapejc-264[mgyfj]\nubhatstkwhnl-vhehkyne-xzz-wxiehrfxgm-917[hexkn]\nvhkkhlbox-vtgwr-vhtmbgz-vnlmhfxk-lxkobvx-163[vhkxb]\nirdgrxzex-tyftfcrkv-rthlzjzkzfe-373[rzfte]\ncvabijtm-rmttgjmiv-lmdmtwxumvb-564[mtvbi]\nhqfxxnknji-gfxpjy-xmnuunsl-151[brtjg]\nodkasqzuo-dmnnuf-xasuefuoe-690[zyejx]\nixeumktoi-pkrrehkgt-sgtgmksktz-384[ktgei]\natyzghrk-igtje-iugzotm-uvkxgzouty-358[rmnqz]\nktwbhtvmbox-xzz-phkdlahi-865[nmsjb]\nnzydfxpc-rclop-ojp-lylwjdtd-951[dlpcj]\nvxupkizork-kmm-sgtgmksktz-280[yublv]\ncvabijtm-kivlg-kwibqvo-twoqabqka-408[pgush]\nhqcfqwydw-fbqijys-whqii-mehaixef-218[vzaur]\nbpvctixr-rpcsn-rdpixcv-ldgzhwde-271[cifnu]\nfnjyxwrinm-kjbtnc-lxwcjrwvnwc-199[nwcjr]\nkzeed-idj-xmnuunsl-593[uazmr]\ndsxxw-zyqicr-bcqgel-236[cqxbd]\ngpewwmjmih-jpsaiv-wivzmgiw-230[iwmgj]\namjmpdsj-afmamjyrc-bcqgel-470[mszht]\neqpuwogt-itcfg-tcorcikpi-hnqygt-ujkrrkpi-596[nywzt]\npelbtravp-pnaql-erprvivat-533[parve]\nyhwooebeaz-bhksan-wymqeoepekj-758[eoabh]\niruzfrtkzmv-upv-kirzezex-529[zpysg]\nlxaaxbren-lqxlxujcn-mnenuxyvnwc-953[nxlac]\nclxalrtyr-prr-nfdezxpc-dpcgtnp-457[prcdl]\nsorozgxe-mxgjk-kmm-vaxingyotm-228[ugkxd]\nvdzonmhydc-eknvdq-otqbgzrhmf-469[jnsrl]\ngsvvswmzi-gspsvjyp-nippcfier-hizipstqirx-802[mvkcd]\nxgvnndadzy-xviyt-xjvodib-yzkgjthzio-707[ncejo]\nemixwvqhml-akidmvomz-pcvb-uizsmbqvo-538[mvibo]\ndpotvnfs-hsbef-cbtlfu-usbjojoh-597[mnkij]\namjmpdsj-pyzzgr-jyzmpyrmpw-522[rxsqz]\nfkqbokxqflkxi-yxphbq-ixyloxqlov-861[xjeyz]\nvehmsegxmzi-tpewxmg-kveww-xvemrmrk-256[emvwx]\naietsrmdih-ikk-viwievgl-750[iekva]\nzekvierkzferc-gcrjkzt-xirjj-nfibjyfg-763[jlbrc]\nkrxqjijamxdb-lqxlxujcn-lxwcjrwvnwc-537[opuqe]\ndsxxw-zsllw-jyzmpyrmpw-652[hgyae]\nmbiyqoxsm-mkxni-mykdsxq-kmaescsdsyx-770[otslp]\noqnidbshkd-vdzonmhydc-idkkxadzm-qdzbpthrhshnm-573[dhkmn]\njqwpihizlwca-moo-apqxxqvo-174[oqaip]\nahngzyzqcntr-azrjds-qdrdzqbg-573[zdqra]\nbhksan-lqnydwoejc-472[gutvo]\njvsvymbs-zjhclunly-obua-zlycpjlz-175[ljyzb]\nwrs-vhfuhw-hjj-ilqdqflqj-205[hjqfl]\negdytrixat-eaphixr-vgphh-ldgzhwde-661[duchs]\noxmeeuruqp-eomhqzsqd-tgzf-mocgueufuaz-196[uemoq]\nahngzyzqcntr-cxd-ehmzmbhmf-677[dqulm]\ngspsvjyp-tpewxmg-kveww-wivzmgiw-568[ghntx]\npualyuhapvuhs-jvuzbtly-nyhkl-wshzapj-nyhzz-thyrlapun-149[kibhn]\nnzcczdtgp-mfyyj-pyrtyppctyr-171[ypctr]\nguahyncw-nij-mywlyn-vohhs-jolwbumcha-760[hnwya]\nbgmxkgtmbhgte-xzz-vhgmtbgfxgm-397[gmbtx]\nzixppfcfba-gbiivybxk-zrpqljbo-pbosfzb-653[psocz]\nvotubcmf-sbccju-nbslfujoh-935[bcufj]\ngsrwyqiv-kvehi-nippcfier-irkmriivmrk-204[irkve]\njsvagsulanw-hdsklau-yjskk-ksdwk-632[ltnxs]\nirdgrxzex-srjbvk-uvgcfpdvek-503[rvdeg]\nkrxqjijamxdb-ljwmh-bcxajpn-849[jxabm]\najmrxjlcren-ljwmh-vjwjpnvnwc-407[yemcd]\nahngzyzqcntr-rbzudmfdq-gtms-btrsnldq-rdquhbd-755[dqrbn]\nrzvkjiduzy-ezggtwzvi-hvmfzodib-291[yuzaf]\nbwx-amkzmb-ntwemz-aitma-408[mabtw]\nwihmogyl-aluxy-vumeyn-mufym-812[wymtu]\nxjmmjndqz-nxvqzibzm-cpio-yzkgjthzio-889[mtsyf]\nxmtjbzidx-ytz-nojmvbz-525[hyzbw]\nbnmrtldq-fqzcd-tmrszakd-qzaahs-cdrhfm-131[wmcrn]\nftzgxmbv-wrx-kxtvjnblbmbhg-293[bxgmt]\ngsvvswmzi-gerhc-wepiw-230[wegis]\npdjqhwlf-fdqgb-uhfhlylqj-699[fhlqd]\nzsxyfgqj-kzeed-uqfxynh-lwfxx-ijuqtdrjsy-957[xfjqy]\nrnqnyfwd-lwfij-uqfxynh-lwfxx-knsfshnsl-359[zbtyx]\nwrs-vhfuhw-gbh-whfkqrorjb-231[hrwbf]\niuxxuyobk-hatte-rumoyzoiy-280[ouyit]\noqnidbshkd-bgnbnkzsd-nodqzshnmr-287[xnmzi]\natyzghrk-jek-jkyomt-540[anzom]\nibghopzs-pogysh-rsdofhasbh-818[hsobg]\nwbhsfbohwcboz-foppwh-rsjszcdasbh-532[njpay]\nexcdklvo-mrymyvkdo-ecob-docdsxq-484[docek]\nxgsvgmotm-yigbktmkx-natz-yzuxgmk-722[zwckh]\najyqqgdgcb-afmamjyrc-qfgnngle-964[pzowt]\nugdgjxmd-jsttal-kzahhafy-138[cyirg]\nirgyyolokj-iuxxuyobk-inuiurgzk-rumoyzoiy-982[sgadc]\nqcbgiasf-ufors-gqojsbusf-vibh-qcbhowbasbh-870[njidq]\nbkwzkqsxq-mrymyvkdo-wkxkqowoxd-146[hfdmy]\nmybbycsfo-mrymyvkdo-bokmaescsdsyx-120[mlnky]\nzuv-ykixkz-jek-ktmotkkxotm-852[mebdc]\ndkqjcbctfqwu-lgnnadgcp-fgrctvogpv-648[cgdfn]\nvehmsegxmzi-ikk-xvemrmrk-724[byndz]\nupq-tfdsfu-cvooz-nbobhfnfou-155[xyskn]\ngpewwmjmih-wgezirkiv-lyrx-hitevxqirx-360[ierwx]\nrdggdhxkt-ytaanqtpc-bpcpvtbtci-817[mnjpk]\nxlrypetn-clmmte-zapcletzyd-405[eltcm]\noxjmxdfkd-oxyyfq-abmxoqjbkq-861[nmhlv]\nxjinphzm-bmvyz-kgvnodx-bmvnn-gjbdnodxn-395[nbdmv]\ntpspahyf-nyhkl-jhukf-zopwwpun-799[phfkn]\njsvagsulanw-usfvq-mkwj-lwklafy-684[alswf]\nipvohghykvbz-kfl-ylhjxbpzpapvu-877[vmizu]\nfydelmwp-awldetn-rcldd-afcnsldtyr-405[dlace]\ngpbepvxcv-tvv-steadnbtci-609[vtbce]\ntipfxvezt-upv-rthlzjzkzfe-581[ztefp]\nbknsykmdsfo-oqq-vyqscdsmc-796[sqcdk]\nejpanjwpekjwh-zua-odellejc-914[ejalp]\nytu-xjhwjy-uqfxynh-lwfxx-jslnsjjwnsl-775[jxlns]\ntinnm-aoubshwq-tzcksf-zopcfohcfm-376[cfohm]\nxjgjmapg-ezggtwzvi-xpnojhzm-nzmqdxz-811[zgjmx]\ntvsnigxmpi-fewoix-hiwmkr-386[tpuvk]\nudglrdfwlyh-udeelw-vhuylfhv-829[ldhue]\nluxciuwncpy-wbiwifuny-mniluay-786[iunwy]\nftzgxmbv-ktuubm-inkvatlbgz-865[btgkm]\nxzwrmkbqtm-zijjqb-twoqabqka-486[erqyp]\ndiozmivodjivg-zbb-ncdkkdib-499[dibko]\nkwvacumz-ozilm-kivlg-lmxizbumvb-980[milvz]\nhwbba-dwppa-tgugctej-648[abgpt]\nmyxcewob-qbkno-bkllsd-cdybkqo-120[atghd]\nzekvierkzferc-irsszk-uvjzxe-477[snqzi]\nwlsiayhcw-dyffsvyuh-guleyncha-526[yhacf]\nclotzlnetgp-ojp-opdtry-249[optlc]\ndmybmsuzs-vqxxknqmz-eqdhuoqe-560[qmdes]\nmtzslklcozfd-clmmte-dstaatyr-275[rtnyq]\ncxy-bnlanc-lqxlxujcn-vjwjpnvnwc-823[ncjlx]\njshzzpmplk-zjhclunly-obua-bzly-alzapun-929[vcuxs]\nyuxufmdk-sdmpq-ngzzk-oazfmuzyqzf-508[kghlv]\notzkxtgzoutgr-kmm-sgtgmksktz-722[tgkmz]\nxgvnndadzy-xviyt-hvmfzodib-941[qbwmr]\nqekrixmg-fyrrc-ywiv-xiwxmrk-230[ikjwl]\ndpssptjwf-dpmpsgvm-qmbtujd-hsbtt-bobmztjt-337[tbmps]\ntcfkqcevkxg-rncuvke-itcuu-ujkrrkpi-388[tabmn]\nhjgbwuladw-tskcwl-xafsfuafy-528[afwls]\nygcrqpkbgf-ecpfa-gpikpggtkpi-154[gpkcf]\nhqcfqwydw-sxesebqju-qdqboiyi-608[qbdei]\niehepwnu-cnwza-ydkykhwpa-iwngapejc-706[waenp]\njchipqat-ytaanqtpc-htgkxrth-115[mfnly]\npinovwgz-ezggtwzvi-xpnojhzm-nzmqdxz-967[yzosw]\nyhwooebeaz-oywrajcan-dqjp-owhao-628[oaweh]\nfhezusjybu-tou-skijecuh-iuhlysu-270[uhsei]\ntcrjjzwzvu-upv-kirzezex-659[bdnty]\nnpmhcargjc-aylbw-amyrgle-qcptgacq-626[tkmzs]\nejpanjwpekjwh-ywjzu-ykwpejc-pnwejejc-160[lnqkc]\ncybyjqho-whqtu-ryexqpqhteki-uww-tuiywd-946[qwyht]\ncqwdujys-uww-bewyijysi-218[wyijs]\nxekdwvwnzkqo-acc-pnwejejc-342[cewjk]\nencuukhkgf-uecxgpigt-jwpv-ugtxkegu-440[kwmxr]\nmbiyqoxsm-tovvilokx-cobfsmoc-224[doavb]\njvuzbtly-nyhkl-jhukf-zlycpjlz-591[jwxzi]\nncjzrpytn-clmmte-lylwjdtd-691[ltcdj]\nenqvbnpgvir-enoovg-erprvivat-117[venrg]\ngzefmnxq-ngzzk-ymdwqfuzs-612[zfgmn]\ngokzyxsjon-cmkfoxqob-rexd-psxkxmsxq-302[zylnb]\naflwjfslagfsd-xdgowj-xafsfuafy-554[rgqmz]\nugdgjxmd-ujqgywfau-hdsklau-yjskk-kzahhafy-294[daelo]\nmvkccspson-mrymyvkdo-nozkbdwoxd-718[odkmc]\negdytrixat-rwdrdapit-stepgibtci-817[ampoz]\nqfmcusbwq-pogysh-fsgsofqv-194[gcthj]\nwifilzof-qyujihctyx-luvvcn-qilembij-344[ilcfj]\ngpbepvxcv-snt-apqdgpidgn-323[dnmyh]\nkpvgtpcvkqpcn-gii-gpikpggtkpi-180[vyxnb]\nziuxioqvo-moo-mvoqvmmzqvo-512[omvqi]\nfbebmtkr-zktwx-vtgwr-vhtmbgz-wxitkmfxgm-631[zilsp]\nwihmogyl-aluxy-luvvcn-wihnuchgyhn-240[hlnuy]\neqnqthwn-lgnnadgcp-rwtejcukpi-726[jwvun]\nhdgdovmt-bmvyz-ytz-yzqzgjkhzio-369[zydgh]\naflwjfslagfsd-usfvq-ugslafy-hmjuzskafy-138[vjmnt]\nfroruixo-iorzhu-uhdftxlvlwlrq-205[eslfx]\nxekdwvwnzkqo-zua-skngodkl-368[kdnow]\nxtwtelcj-rclop-clmmte-dpcgtnpd-353[jowtx]\nlhkhszqx-fqzcd-cxd-nodqzshnmr-911[dhqzc]\nfodvvlilhg-fdqgb-xvhu-whvwlqj-725[syfpw]\nmtzslklcozfd-dnlgpyrpc-sfye-cpdplcns-873[zngtm]\nrwcnawjcrxwju-yujbcrl-pajbb-jwjuhbrb-459[jbrwc]\nhcd-gsqfsh-awzwhofm-ufors-suu-twbobqwbu-948[reunt]\npwcvonofrcig-pibbm-obozmgwg-688[zgthm]\nvhehkyne-lvtoxgzxk-angm-wxiehrfxgm-345[xeghk]\nucynmlgxcb-njyqrga-epyqq-qrmpyec-938[mgnpj]\nfruurvlyh-fdqgb-frdwlqj-uhvhdufk-699[fudhr]\nhqfxxnknji-gzssd-yjhmstqtld-697[sdhjn]\nqzoggwtwsr-rms-rsdofhasbh-402[gtlom]\ngzefmnxq-ngzzk-dqeqmdot-638[yatsz]\nrmn-qcapcr-njyqrga-epyqq-pcqcypaf-834[mpqie]\nyknnkoera-ywjzu-zarahkliajp-186[yozsd]\nclxalrtyr-eza-dpncpe-mldvpe-epnsyzwzrj-483[eplrz]\nvkrhzxgbv-cxeeruxtg-vhgmtbgfxgm-137[fsxoz]\nymszqfuo-bxmefuo-sdmee-mzmxkeue-898[ndgcf]\ndmbttjgjfe-sbccju-bdrvjtjujpo-649[vkijs]\nwifilzof-wbiwifuny-guleyncha-136[ifwln]\noxmeeuruqp-vqxxknqmz-abqdmfuaze-196[baztd]\ntinnm-qfmcusbwq-pogysh-gvwddwbu-636[aryhp]\nlxaaxbren-ouxfna-bnaerlnb-693[anbxe]\nnglmtuex-xzz-mktbgbgz-397[zqyrt]\nxlrypetn-mfyyj-pyrtyppctyr-223[yprtc]\nfodvvlilhg-fdqgb-vklsslqj-127[lvdfg]\nikhcxvmbex-lvtoxgzxk-angm-ehzblmbvl-761[xblmv]\nfkqbokxqflkxi-ciltbo-qoxfkfkd-211[kfoqx]\nlujbbrornm-bljenwpna-qdwc-fxatbqxy-589[bnajl]\neqpuwogt-itcfg-tcddkv-vgejpqnqia-258[besga]\nlnkfaypeha-ydkykhwpa-zaoecj-108[zamyw]\nlhkhszqx-fqzcd-atmmx-lzqjdshmf-859[hmqzd]\naflwjfslagfsd-tskcwl-vwhsjlewfl-190[xevmq]\npbafhzre-tenqr-wryylorna-fuvccvat-507[racef]\njvsvymbs-ibuuf-yljlpcpun-773[ubjlp]\nfab-eqodqf-rxaiqd-etubbuzs-612[bqade]\ncxy-bnlanc-ljwmh-nwprwnnarwp-251[nwacl]\nhdgdovmt-bmvyz-pinovwgz-ytz-omvdidib-239[qfmcj]\nwsvsdkbi-qbkno-mkxni-mykdsxq-bokmaescsdsyx-328[skbdm]\nnjmjubsz-hsbef-gmpxfs-tijqqjoh-727[ykelf]\nfoadouwbu-qobrm-oqeiwgwhwcb-142[owbqu]\ncvabijtm-kivlg-ewzsapwx-538[posuz]\nxgsvgmotm-igtje-gtgreyoy-696[gtemo]\noaddaeuhq-ngzzk-efadmsq-612[adeqz]\nzgmfyxypbmsq-pyzzgr-yaosgqgrgml-470[efsgy]\nwihmogyl-aluxy-vumeyn-zchuhwcha-110[eisnw]\nhafgnoyr-fpniratre-uhag-phfgbzre-freivpr-663[rfaeg]\njqwpihizlwca-zijjqb-ewzsapwx-174[ognyv]\nuwtojhynqj-hfsid-htfynsl-ijajqturjsy-619[jhsty]\nhqfxxnknji-kqtbjw-wjhjnansl-177[ctzqd]\nupq-tfdsfu-dboez-dpbujoh-mphjtujdt-103[dujpt]\ntfiifjzmv-jtrmvexvi-ylek-wzeretzex-919[kuzli]\nugjjgkanw-hdsklau-yjskk-vwkayf-840[omzwl]\nugdgjxmd-kusnwfywj-zmfl-ogjckzgh-840[gjdfk]\nvehmsegxmzi-fewoix-hitevxqirx-308[eixhm]\nyflexwxoalrp-bdd-absbilmjbkq-419[esuky]\nkwzzwaqdm-rmttgjmiv-lmxizbumvb-330[mzbit]\nhtqtwkzq-hfsid-yjhmstqtld-593[thqds]\ntinnm-qobrm-qcohwbu-difqvogwbu-740[boqim]\ntipfxvezt-jtrmvexvi-ylek-nfibjyfg-659[fqnis]\nlzfmdshb-atmmx-qdzbpthrhshnm-859[hmbds]\nnij-mywlyn-mwupyhayl-bohn-qilembij-292[vwady]\njchipqat-hrpktcvtg-wjci-gthtpgrw-999[tcghp]\ndyz-combod-oqq-mecdywob-cobfsmo-250[obcdm]\ndkqjcbctfqwu-ecpfa-vgejpqnqia-310[crelp]\ngsrwyqiv-kvehi-gerhc-stivexmsrw-646[slxzf]\nhmsdqmzshnmzk-bgnbnkzsd-cdozqsldms-261[sdmzn]\ntfejldvi-xiruv-srjbvk-uvmvcfgdvek-217[kfcmn]\nwrs-vhfuhw-exqqb-dqdobvlv-751[qvbdh]\nwillimcpy-jfumncw-alumm-mufym-682[dsbwk]\netaqigpke-lgnnadgcp-ceswkukvkqp-856[fnltm]\ndiozmivodjivg-nxvqzibzm-cpio-gvwjmvojmt-603[vywzn]\noxjmxdfkd-oxyyfq-absbilmjbkq-809[bxdfj]\nuqtqbizg-ozilm-moo-wxmzibqwva-564[indml]\nrdchjbtg-vgpst-uadltg-gtprfjxhxixdc-323[czknl]\npybgmyargtc-amjmpdsj-njyqrga-epyqq-mncpyrgmlq-808[rzoqv]\nsbqiiyvyut-sxesebqju-huiuqhsx-582[suiqb]\nclxalrtyr-dnlgpyrpc-sfye-epnsyzwzrj-873[rylpc]\namlqskcp-epybc-cee-bcqgel-756[ceblp]\njrncbavmrq-pnaql-pbngvat-qrirybczrag-377[rabnq]\ncebwrpgvyr-onfxrg-qrcnegzrag-221[rgcen]\nforwcoqhwjs-tzcksf-rsjszcdasbh-792[scfhj]\nckgvutofkj-pkrrehkgt-jkvgxzsktz-696[wxbfz]\nkzeed-uqfxynh-lwfxx-qtlnxynhx-255[xnefh]\nvhkkhlbox-vtgwr-hixktmbhgl-683[hkbgl]\nmrxivrexmsrep-hci-viwievgl-464[msqei]\nnsyjwsfyntsfq-idj-htsyfnsrjsy-931[syfjn]\nawzwhofm-ufors-qobrm-qcohwbu-aofyshwbu-272[owbfh]\nahngzyzqcntr-bzmcx-cdoknxldms-651[cnzdm]\nnsyjwsfyntsfq-hfsid-wjfhvznxnynts-671[dqrws]\nkrxqjijamxdb-npp-uxprbcrlb-589[vutpy]\nahngzyzqcntr-azrjds-knfhrshbr-209[qnogp]\npejji-bkllsd-crszzsxq-458[xlhso]\nqcffcgwjs-gqojsbusf-vibh-zcuwghwqg-480[njzmp]\nziuxioqvo-moo-amzdqkma-174[zeuba]\nujqgywfau-aflwjfslagfsd-vqw-kwjnauwk-398[wafju]\nelrkdcdugrxv-fdqgb-orjlvwlfv-101[mhsyz]\nkpvgtpcvkqpcn-tcddkv-qrgtcvkqpu-700[ptqjs]\njfifqxov-doxab-avb-xkxivpfp-107[xfvab]\nlsyrkjkbnyec-mkxni-mykdsxq-kmaescsdsyx-978[mbynk]\nocipgvke-lgnnadgcp-wugt-vguvkpi-206[hugza]\nhcd-gsqfsh-qvcqczohs-rsgwub-142[dhpmf]\nlsyrkjkbnyec-oqq-ckvoc-822[ckoqy]\nvhkkhlbox-utldxm-vnlmhfxk-lxkobvx-787[xklhv]\nvkppo-cqwdujys-vbemuh-qdqboiyi-504[qbdio]\nqjopwxha-ywjzu-zaoecj-654[jaowz]\nnjmjubsz-hsbef-dipdpmbuf-efqbsunfou-311[bfusd]\nktiaaqnqml-jiasmb-lmdmtwxumvb-694[yxlgt]\nvrurcjah-pajmn-lqxlxujcn-fxatbqxy-511[ztgdk]\nvagreangvbany-qlr-znexrgvat-325[yblnw]\nlgh-kwujwl-wyy-jwsuimakalagf-996[gsubl]\napuut-xgvnndadzy-ezggtwzvi-zibdizzmdib-343[qlykv]\npxtihgbsxw-utldxm-kxlxtkva-787[xtkla]\nmfklstdw-esyfwlau-usfvq-vwkayf-762[kljiy]\neqpuwogt-itcfg-hwbba-fag-fgrnqaogpv-232[gafbo]\nqzoggwtwsr-rms-rsdzcmasbh-688[srgmw]\nyhkpvhjapcl-ibuuf-jbzavtly-zlycpjl-955[skwvb]\ngpewwmjmih-hci-gywxsqiv-wivzmgi-620[txcfj]\nlahxpnwrl-npp-vjatncrwp-537[aisyo]\nckgvutofkj-hatte-aykx-zkyzotm-436[ntzbr]\niehepwnu-cnwza-lhwopey-cnwoo-ykjpwejiajp-628[wepjn]\nfkqbokxqflkxi-yxphbq-obpbxoze-471[napmi]\netyyx-cxd-lzqjdshmf-261[inzys]\nftzgxmbv-utldxm-ftkdxmbgz-267[wqkjm]\njyfvnlupj-jhukf-jvhapun-klwsvftlua-903[yrgnq]\nzsxyfgqj-jll-qfgtwfytwd-489[sazdc]\noxjmxdfkd-zxkav-zlxqfkd-rpbo-qbpqfkd-263[vauwt]\ndsxxw-cee-bcnyprkclr-470[ghzni]\nenzcntvat-fpniratre-uhag-jbexfubc-533[aentb]\nfroruixo-mhoobehdq-dqdobvlv-803[odbhq]\nraphhxuxts-qphzti-bpcpvtbtci-115[pthbc]\njvsvymbs-jhukf-jvhapun-shivyhavyf-955[yabwx]\nykhknbqh-ywjzu-odellejc-498[ehjkl]\navw-zljyla-ihzrla-zlycpjlz-201[uvdxz]\nwdjcvuvmyjpn-nxvqzibzm-cpio-hvivbzhzio-967[vizbc]\nxgjougizobk-pkrrehkgt-ktmotkkxotm-150[gnkzc]\nkyelcrga-aylbw-rcaflmjmew-808[wsmtg]\nlaffe-atyzghrk-igtje-jkyomt-462[taefg]\nhqtyeqsjylu-uww-ijehqwu-608[quweh]\nkzgwomvqk-kivlg-kcabwumz-amzdqkm-200[cdavq]\navw-zljyla-jhukf-shivyhavyf-305[ahvyf]\nguahyncw-vumeyn-xypyfijgyhn-370[ynghu]\nkwtwznct-jiasmb-zmikycqaqbqwv-564[wbjnt]\nsorozgxe-mxgjk-hatte-vaxingyotm-228[enmvq]\nhqtyeqsjylu-sxesebqju-bqrehqjeho-348[nxucm]\nqzoggwtwsr-awzwhofm-ufors-tzcksf-rsdofhasbh-948[sfowh]\njfifqxov-doxab-mixpqfz-doxpp-qbzeklildv-185[rydoa]\ngsvvswmzi-vehmsegxmzi-fyrrc-irkmriivmrk-204[imrvs]\ndlhwvupglk-qlssfilhu-ylzlhyjo-721[lhsuy]\ncrwwv-zxkav-absbilmjbkq-679[bakvw]\nxzwrmkbqtm-lgm-zmkmqdqvo-720[mqkzb]\neqnqthwn-ecpfa-eqcvkpi-qrgtcvkqpu-570[qcepk]\nftzgxmbv-utldxm-nlxk-mxlmbgz-891[mxlbg]\nxqvwdeoh-gbh-ghyhorsphqw-387[hgoqw]\nrdchjbtg-vgpst-uadltg-pcpanhxh-141[mtvxn]\nsebehvkb-vbemuh-udwyduuhydw-140[ubdeh]\ngpsxdprixkt-qphzti-stktadebtci-921[tipdk]\nnij-mywlyn-dyffsvyuh-omyl-nymncha-214[obtqu]\nrdggdhxkt-rpcsn-rdpixcv-bpgztixcv-843[cdgpr]\npdjqhwlf-iorzhu-uhdftxlvlwlrq-803[rtwsz]\ntinnm-dzoghwq-ufogg-twbobqwbu-428[bgown]\netyyx-qzaahs-lzmzfdldms-781[cmnek]\nwillimcpy-dyffsvyuh-fuvilunils-448[sjytb]\ndpotvnfs-hsbef-qmbtujd-hsbtt-ufdiopmphz-831[zmvga]\nhdgdovmt-bmvyz-ytz-xpnojhzm-nzmqdxz-109[hzpfs]\nksodcbwnsr-qobrm-aobousasbh-324[bosar]\nmyvybpev-tovvilokx-kmaescsdsyx-380[vsyek]\nnbhofujd-cbtlfu-tbmft-571[mkltr]\nsedikcuh-whqtu-uww-jusxdebewo-764[uwedh]\njvsvymbs-jhukf-klclsvwtlua-825[jxhaq]\ncrwwv-mixpqfz-doxpp-jxohbqfkd-575[serbn]\nfmsledevhsyw-hci-xiglrspskc-646[scehi]\nxekdwvwnzkqo-ywjzu-oanreyao-576[dwrqm]\ngzefmnxq-vqxxknqmz-pqbmdfyqzf-352[xuyzs]\nbqvvu-zua-hkceopeyo-706[eouva]\nytu-xjhwjy-gfxpjy-btwpxmtu-151[bynhm]\nnpmhcargjc-hcjjwzcyl-bctcjmnkclr-886[cjhlm]\nxlrypetn-dnlgpyrpc-sfye-dlwpd-119[znfjd]\nejpanjwpekjwh-ydkykhwpa-hkceopeyo-758[patzv]\nlhkhszqx-fqzcd-eknvdq-rsnqzfd-287[qdzfh]\nfroruixo-fdqgb-orjlvwlfv-179[optcg]\njvsvymbs-jovjvshal-jbzavtly-zlycpjl-253[zcnfy]\navw-zljyla-ibuuf-ylzlhyjo-149[xtcfz]\nbnmrtldq-fqzcd-bzmcx-bnzshmf-cdudknoldms-157[whdus]\nsno-rdbqds-idkkxadzm-rsnqzfd-703[dsknq]\nvkppo-sxesebqju-tuiywd-504[epsub]\nryexqpqhteki-zubboruqd-husuylydw-790[nimls]\nvetllbybxw-lvtoxgzxk-angm-kxvxbobgz-995[xbglv]\nrdchjbtg-vgpst-qphzti-gtrtxkxcv-817[mayne]\ndzczkrip-xiruv-irdgrxzex-vxx-rthlzjzkzfe-503[xwhmg]\nqcbgiasf-ufors-pogysh-sbuwbssfwbu-454[nshbt]\nqcbgiasf-ufors-qobrm-qcohwbu-igsf-hsghwbu-142[bsfgh]\nzgmfyxypbmsq-pyzzgr-amlryglkclr-392[yglmr]\nmyxcewob-qbkno-cmkfoxqob-rexd-vklybkdybi-146[wxnuy]\namlqskcp-epybc-afmamjyrc-pcacgtgle-418[campe]\nmuqfedyput-isqludwuh-xkdj-huqsgkyiyjyed-660[nbtda]\nvkppo-sqdto-vydqdsydw-114[pzbiy]\nziuxioqvo-jcvvg-lmxtwgumvb-668[fnbjv]\nrdchjbtg-vgpst-rwdrdapit-stepgibtci-271[tdgip]\nzbytomdsvo-zvkcdsm-qbkcc-zebmrkcsxq-614[nwmol]\nsbnqbhjoh-fhh-efqbsunfou-103[hjxvu]\nvagreangvbany-ohaal-nanylfvf-273[zfytn]\nwihmogyl-aluxy-dyffsvyuh-lyuwkocmcncih-760[efwrt]\nirgyyolokj-inuiurgzk-ykxboiky-332[ikyog]\ngntmfefwitzx-xhfajsljw-mzsy-fhvznxnynts-437[mkuja]\ntpspahyf-nyhkl-yhiipa-zhslz-539[yzmib]\nencuukhkgf-rncuvke-itcuu-nqikuvkeu-700[ukcen]\nmybbycsfo-mkxni-oxqsxoobsxq-198[oxbsm]\nkyelcrga-zsllw-kypicrgle-730[nvjmt]\nrdggdhxkt-uadltg-stktadebtci-713[btson]\ndpssptjwf-qmbtujd-hsbtt-usbjojoh-623[miqos]\ntcfkqcevkxg-dcumgv-vgejpqnqia-336[cgqve]\nfodvvlilhg-gbh-orjlvwlfv-699[eykml]\nbxaxipgn-vgpst-eaphixr-vgphh-ejgrwphxcv-817[rsizj]\npualyuhapvuhs-ibuuf-jvuahputlua-305[hlzmu]\nqekrixmg-nippcfier-gsrxemrqirx-646[xhnfm]\npdjqhwlf-plolwdub-judgh-fdqgb-ghsorbphqw-543[aiewf]\nfruurvlyh-vfdyhqjhu-kxqw-fxvwrphu-vhuylfh-647[hufvr]\nftzgxmbv-utldxm-ftgtzxfxgm-891[txfgm]\nhtsxzrjw-lwfij-gfxpjy-btwpxmtu-359[jtwxf]\ngpewwmjmih-jyddc-hci-vigimzmrk-932[imcdg]\nyuxufmdk-sdmpq-qss-oazfmuzyqzf-378[fmqsu]\noxmeeuruqp-eomhqzsqd-tgzf-efadmsq-508[oxhfu]\nqzoggwtwsr-xszzmpsob-hsqvbczcum-610[scyrz]\navw-zljyla-ibuuf-ayhpupun-981[ualpy]\nzloolpfsb-oxyyfq-bkdfkbbofkd-471[untjs]\ntvsnigxmpi-jpsaiv-erepcwmw-308[nwfcx]\njvuzbtly-nyhkl-qlssfilhu-mpuhujpun-929[ulhjn]\nyknnkoera-ydkykhwpa-pnwejejc-290[setqd]\ntcrjjzwzvu-gcrjkzt-xirjj-ljvi-kvjkzex-659[jzkrv]\ngntmfefwitzx-hmthtqfyj-xytwflj-307[tsebr]\ngspsvjyp-wgezirkiv-lyrx-pefsvexsvc-412[svepg]\nugfkmewj-yjsvw-xdgowj-jwuwanafy-944[hysdk]\nsbnqbhjoh-qmbtujd-hsbtt-tijqqjoh-597[bzawy]\nvetllbybxw-unggr-tgterlbl-631[mfwxo]\ntipfxvezt-avccpsvre-tljkfdvi-jvimztv-139[vtice]\nhvbizodx-wpiit-yzkvmohzio-603[ytsvn]\nsno-rdbqds-eknvdq-nodqzshnmr-209[dnqso]\nrtqlgevkng-dcumgv-rwtejcukpi-960[yhfsz]\nugjjgkanw-tmffq-ksdwk-606[bqdtn]\njyfvnlupj-jhukf-jvhapun-ylhjxbpzpapvu-981[ygxts]\nkzeed-gzssd-ijufwyrjsy-203[sdejy]\nchnylhuncihuf-jfumncw-alumm-uwkocmcncih-864[btkms]\nqfmcusbwq-suu-ghcfous-922[btras]\nbgmxkgtmbhgte-ietlmbv-zktll-xgzbgxxkbgz-215[isyml]\npwcvonofrcig-xszzmpsob-zopcfohcfm-506[avfiu]\niruzfrtkzmv-dzczkrip-xiruv-treup-tfrkzex-fgvirkzfej-633[rzfik]\nmrxivrexmsrep-nippcfier-qerekiqirx-776[ombwt]\niwcjapey-ywjzu-ykwpejc-ykjpwejiajp-420[ztgqm]\njoufsobujpobm-qmbtujd-hsbtt-sfbdrvjtjujpo-467[jbotu]\nxst-wigvix-yrwxefpi-gerhc-hiwmkr-230[mylsd]\nytu-xjhwjy-ojqqdgjfs-xmnuunsl-931[mvbrl]\nzovldbkfz-avb-jxkxdbjbkq-159[bkdjv]\nqvbmzvibqwvit-ntwemz-amzdqkma-226[mqvza]\neadalsjq-yjsvw-xdgowj-ljsafafy-840[nqijl]\ndszphfojd-tdbwfohfs-ivou-bdrvjtjujpo-233[ximod]\ngsvvswmzi-tpewxmg-kveww-erepcwmw-308[wizmq]\nktwbhtvmbox-ktuubm-hixktmbhgl-657[hynsw]\niuruxlar-vrgyzoi-mxgyy-sgtgmksktz-488[ufytd]\nnzydfxpc-rclop-awldetn-rcldd-nzyeltyxpye-379[pusht]\niehepwnu-cnwza-ynukcajey-lhwopey-cnwoo-pnwejejc-212[enwcj]\nvcibutulxiom-jfumncw-alumm-ijyluncihm-214[muicl]\npyknyegle-aylbw-qyjcq-392[hzumy]\natyzghrk-xghhoz-cuxqynuv-436[cmdsl]\nvcibutulxiom-jfumncw-alumm-jolwbumcha-682[dgfeu]\ncybyjqho-whqtu-isqludwuh-xkdj-cqdqwucudj-946[qudch]\nlejkrscv-jtrmvexvi-ylek-uvgrikdvek-893[vekri]\nnvrgfezqvu-upv-jkfirxv-789[vfrue]\nfnjyxwrinm-ljwmh-lxjcrwp-bjunb-173[ljyap]\ngsrwyqiv-kvehi-qekrixmg-fyrrc-wepiw-360[tnixb]\ngsvvswmzi-fyrrc-hitevxqirx-308[irvsx]\nnglmtuex-ynssr-vahvhetmx-wxlbzg-267[xeghl]\nqjopwxha-acc-ykjpwejiajp-524[gjqhn]\nwrs-vhfuhw-mhoobehdq-dqdobvlv-803[pdlvm]\notzkxtgzoutgr-inuiurgzk-uvkxgzouty-878[modya]\ngvcskirmg-fyrrc-xvemrmrk-568[rmcgk]\nxqvwdeoh-hjj-ghsduwphqw-231[hwdjq]\nsbejpbdujwf-cvooz-nbslfujoh-441[nwsha]\nzixppfcfba-oxyyfq-ixyloxqlov-315[xfoyi]\nbdavqofuxq-rxaiqd-pqhqxabyqzf-846[yzpfi]\nvhglnfxk-zktwx-vetllbybxw-ktuubm-hixktmbhgl-501[bkltx]\ntinnm-qobrm-qcohwbu-zcuwghwqg-584[ejnps]\nrmn-qcapcr-kyelcrga-cee-bcqgel-730[cerag]\napwmeclga-djmucp-ylyjwqgq-756[acgjl]\npybgmyargtc-amlqskcp-epybc-zsllw-pcacgtgle-392[cglpa]\njxdkbqfz-avb-tlohpelm-783[blade]\nnpmhcargjc-bwc-pcqcypaf-808[phjds]\nrdchjbtg-vgpst-qphzti-itrwcdadvn-843[zueyn]\nvotubcmf-qmbtujd-hsbtt-sfdfjwjoh-259[tbfjd]\nujoon-gpqqxi-advxhixrh-661[mlyen]\nykjoqian-cnwza-lhwopey-cnwoo-iwjwcaiajp-576[waoci]\ngpewwmjmih-wgezirkiv-lyrx-xvemrmrk-386[mreiw]\ngzefmnxq-ngzzk-pqhqxabyqzf-352[drqzm]\nnwilwcejc-nwxxep-oanreyao-394[lqxwm]\nhdgdovmt-bmvyz-zbb-gjbdnodxn-785[bdgmn]\ngsrwyqiv-kvehi-aietsrmdih-gerhc-gsexmrk-viwievgl-672[bsytl]\nrdchjbtg-vgpst-tvv-rdcipxcbtci-999[ctvbd]\njoufsobujpobm-fhh-tbmft-389[mnyql]\nfnjyxwrinm-mhn-anbnjalq-147[nmbzl]\nwfummczcyx-yaa-guhuaygyhn-578[yaucg]\nqfkkj-mfyyj-dpcgtnpd-457[dfjkp]\nncjzrpytn-mfyyj-wzrtdetnd-509[qnwdl]\nsno-rdbqds-bnknqetk-idkkxadzm-bnmszhmldms-365[dkmns]\nwkqxodsm-cmkfoxqob-rexd-vyqscdsmc-380[cdmoq]\ndpssptjwf-tdbwfohfs-ivou-tbmft-233[lbdah]\ndpssptjwf-dipdpmbuf-xpsltipq-285[pdsfi]\nqyujihctyx-wuhxs-wiuncha-jolwbumcha-214[zlbuy]\noxmeeuruqp-pkq-iadwetab-716[eapqu]\nwfummczcyx-ohmnuvfy-xsy-womnigyl-mylpcwy-214[ymcwf]\nxmtjbzidx-ytz-ncdkkdib-525[wmfvr]\nqekrixmg-jpsaiv-xiglrspskc-204[dwvst]\nkwtwznct-zijjqb-mvoqvmmzqvo-356[qmnjk]\nltpedcxots-ytaanqtpc-rdcipxcbtci-999[lkmsv]\nzovldbkfz-yrkkv-abmxoqjbkq-913[kboqv]\nyhkpvhjapcl-wshzapj-nyhzz-jvuahputlua-279[cnmzy]\npdjqhwlf-edvnhw-whfkqrorjb-257[unmsk]\nrgllk-bdavqofuxq-rxaiqd-iadwetab-664[mkeil]\nwdjcvuvmyjpn-nxvqzibzm-cpio-nzmqdxzn-343[nzmvc]\nxzwrmkbqtm-kpwkwtibm-nqvivkqvo-486[dcwog]\nrdchjbtg-vgpst-rpcsn-rdpixcv-hidgpvt-765[stnfw]\nbuzahisl-lnn-thuhnltlua-955[oschg]\nenzcntvat-ohaal-bcrengvbaf-793[anbce]\neqpuwogt-itcfg-uecxgpigt-jwpv-hkpcpekpi-362[pgcei]\navw-zljyla-qlssfilhu-dvyrzovw-175[lvasw]\niuruxlar-xgsvgmotm-inuiurgzk-zxgototm-982[mlnut]\ntyepcyletzylw-prr-opalcexpye-925[boymz]\nhqcfqwydw-rqiauj-huiuqhsx-556[abndo]\ntcrjjzwzvu-vxx-kirzezex-841[zxejr]\nqspkfdujmf-sbccju-sfdfjwjoh-285[ktqja]\nvcibutulxiom-wbiwifuny-guleyncha-682[uzxms]\nejpanjwpekjwh-bqvvu-ywjzu-nayaerejc-628[jeawn]\nkwvacumz-ozilm-kivlg-lmdmtwxumvb-330[mlvik]\nkzgwomvqk-kwvacumz-ozilm-zijjqb-bziqvqvo-460[zqvik]\nwfintfhynaj-wfggny-qfgtwfytwd-775[fwgnt]\ntcfkqcevkxg-hnqygt-vgejpqnqia-622[qgcek]\nyrwxefpi-nippcfier-wepiw-386[ipewf]\nxjinphzm-bmvyz-zbb-omvdidib-109[bimzd]\nqlm-pbzobq-ciltbo-abmilvjbkq-107[jvsxc]\ntfcfiwlc-gcrjkzt-xirjj-tfekrzedvek-295[wjhqa]\nnchhg-moo-lmdmtwxumvb-382[mhobc]\nbknsykmdsfo-lkcuod-myxdksxwoxd-692[azknp]\njxdkbqfz-yrkkv-qoxfkfkd-211[kfdqx]\njlidywncfy-dyffsvyuh-lyuwkocmcncih-344[ycfdh]\niuruxlar-igtje-iugzotm-lotgtiotm-358[tigou]\nfoadouwbu-gqojsbusf-vibh-qighcasf-gsfjwqs-116[sfbgo]\nucynmlgxcb-aylbw-nspafyqgle-288[fswap]\namppmqgtc-aylbw-qfgnngle-808[galmn]\nkfg-jvtivk-irsszk-jrcvj-659[jkvir]\nxjinphzm-bmvyz-ytz-yzqzgjkhzio-681[ubzyj]\nplolwdub-judgh-fdqgb-ilqdqflqj-491[dlqbf]\ncrwwv-yrkkv-bkdfkbbofkd-783[inhxy]\nnuatmlmdpage-otaoaxmfq-pqhqxabyqzf-612[qvdxy]\npualyuhapvuhs-ibuuf-jbzavtly-zlycpjl-435[znegj]\neza-dpncpe-clmmte-lylwjdtd-509[delcm]\ntfejldvi-xiruv-irsszk-uvgcfpdvek-659[rvaql]\npybgmyargtc-aylbw-qcptgacq-600[oscut]\nkdijqrbu-vbemuh-qdqboiyi-972[biqdu]\nirgyyolokj-vrgyzoi-mxgyy-jkvruesktz-644[ygkor]\nrgllk-uzfqdzmfuazmx-otaoaxmfq-oazfmuzyqzf-560[zfamo]\niqmbazulqp-eomhqzsqd-tgzf-fqotzaxask-378[qmsxo]\noqnidbshkd-atmmx-kzanqzsnqx-703[vztcl]\nvjpwncrl-lqxlxujcn-mnyjacvnwc-615[cnjlv]\nbkzrrhehdc-cxd-bnmszhmldms-807[dhmbc]\nkgjgrypw-epybc-zyqicr-bcnyprkclr-704[mzsty]\napuut-ezggtwzvi-yzqzgjkhzio-265[pmlri]\nrflsjynh-hfsid-htfynsl-qtlnxynhx-567[cqbst]\nzilqwikbqdm-lgm-nqvivkqvo-330[wmxzv]\nlahxpnwrl-ouxfna-anlnrerwp-355[nzkvm]\nveqtekmrk-ikk-tyvglewmrk-386[kemrt]\nsgmtkzoi-pkrrehkgt-rumoyzoiy-514[zytsw]\nyflexwxoalrp-oxyyfq-mrozexpfkd-341[xfoye]\nbwx-amkzmb-kivlg-kwibqvo-xczkpiaqvo-434[lkqrz]\nclxalrtyr-nsznzwlep-opdtry-145[nczlj]\nbjfutsneji-jll-wjhjnansl-125[szrni]\nbcfhvdczs-cpxsqh-ghcfous-324[chsfb]\naflwjfslagfsd-kusnwfywj-zmfl-ugflsafewfl-216[flswa]\ngcfcnuls-aluxy-wuhxs-jolwbumcha-578[uclah]\npyknyegle-pybgmyargtc-aylbw-qfgnngle-470[gyeln]\noazegyqd-sdmpq-gzefmnxq-qss-geqd-fqefuzs-508[qesdf]\nxjmmjndqz-mvwwdo-yzkvmohzio-551[ypzog]\nzekvierkzferc-treup-uvgcfpdvek-789[stzno]\nejpanjwpekjwh-xqjju-odellejc-576[enmtc]\nltpedcxots-tvv-sthxvc-115[skptq]\njshzzpmplk-yhiipa-zavyhnl-981[tluns]\nmvhkvbdib-agjrzm-yzqzgjkhzio-629[wcyms]\nyhwooebeaz-acc-paydjkhkcu-316[acehk]\ngzefmnxq-otaoaxmfq-emxqe-326[emqxa]\nfrqvxphu-judgh-udeelw-pdqdjhphqw-335[orhsy]\nfrqvxphu-judgh-gbh-uhfhlylqj-153[hufgj]\ncjpibabsepvt-cvooz-fohjoffsjoh-623[emnjh]\nyflexwxoalrp-zxkav-zlxqfkd-xkxivpfp-783[xfklp]\nfroruixo-hjj-zrunvkrs-777[synml]\njvuzbtly-nyhkl-jhukf-jvhapun-jvuahputlua-929[ndjmy]\nkwzzwaqdm-kivlg-kwibqvo-nqvivkqvo-460[yzmsr]\nktiaaqnqml-zijjqb-apqxxqvo-798[qaijx]\nhqfxxnknji-hfsid-wjhjnansl-931[nhjfi]\nxjmmjndqz-wpiit-vxlpdndodji-941[dijmn]\nksodcbwnsr-rms-cdsfohwcbg-896[xvuol]\neza-dpncpe-tyepcyletzylw-nsznzwlep-nzyeltyxpye-847[xydvf]\nemixwvqhml-jiasmb-ivitgaqa-928[iamqv]\netyyx-idkkxadzm-ehmzmbhmf-313[josnm]\nlhkhszqx-fqzcd-bgnbnkzsd-qdzbpthrhshnm-911[bqzra]\ndzczkrip-xiruv-upv-wzeretzex-945[icynm]\nwihmogyl-aluxy-mwupyhayl-bohn-lymyulwb-266[nuraz]\nkmjezxodgz-xcjxjgvoz-zibdizzmdib-239[yzkgs]\nhqfxxnknji-wfggny-hzxytrjw-xjwanhj-593[jnxhw]\noknkvcta-itcfg-eqpuwogt-itcfg-ecpfa-eqcvkpi-ucngu-986[cgtef]\nykhknbqh-oywrajcan-dqjp-qoan-paopejc-810[ondma]\nnwilwcejc-ywjzu-ykwpejc-naoawnyd-238[zjwsh]\ndzczkrip-xiruv-sleep-rercpjzj-451[wykfr]\ngpewwmjmih-nippcfier-qerekiqirx-178[ieprm]\nbqvvu-oywrajcan-dqjp-wjwhuoeo-420[jowaq]\nkzgwomvqk-xtiabqk-oziaa-bziqvqvo-148[qaiko]\nfab-eqodqf-eomhqzsqd-tgzf-fdmuzuzs-820[fqzde]\nlzfmdshb-dff-sqzhmhmf-755[fhmds]\nbpvctixr-gpqqxi-sthxvc-297[xcipq]\nxjgjmapg-kmjezxodgz-xcjxjgvoz-vivgtndn-915[jhigl]\npbybeshy-qlr-bcrengvbaf-715[jwrxz]\nuqtqbizg-ozilm-kivlg-tijwzibwzg-902[lrepd]\nexcdklvo-zbytomdsvo-zvkcdsm-qbkcc-crszzsxq-614[rpnqm]\nucynmlgxcb-njyqrga-epyqq-kylyeckclr-418[yclqe]\nhqtyeqsjylu-sxesebqju-mehaixef-556[eqshj]\nchnylhuncihuf-wifilzof-jfumncw-alumm-uwkocmcncih-734[cufhi]\nwyvqljapsl-ihzrla-zhslz-669[ncmjb]\njlidywncfy-wifilzof-vohhs-omyl-nymncha-578[yfhil]\njfifqxov-doxab-bdd-abpfdk-913[dbfao]\nxjgjmapg-wpiit-gjbdnodxn-551[zvmhq]\ndkqjcbctfqwu-tcfkqcevkxg-ecpfa-eqcvkpi-tgegkxkpi-414[ckeqf]\ntmrszakd-idkkxadzm-lzmzfdldms-365[hwgsv]\nnglmtuex-vtgwr-vhtmbgz-mxvaghehzr-215[tsfmz]\nuiovmbqk-rmttgjmiv-bziqvqvo-252[vimqb]\niehepwnu-cnwza-fahhuxawj-oanreyao-680[mavot]\ntvsnigxmpi-glsgspexi-gsrxemrqirx-100[xwqld]\nqcbgiasf-ufors-rms-aobousasbh-818[sabof]\nsgmtkzoi-hatte-xkykgxin-722[ktgix]\nnglmtuex-xzz-tvjnblbmbhg-787[kopjm]\nikhcxvmbex-vtgwr-xgzbgxxkbgz-683[ncalt]\ntbxmlkfwba-molgbzqfib-zxkav-pbosfzbp-419[bfzak]\ngspsvjyp-fmsledevhsyw-tpewxmg-kveww-eguymwmxmsr-568[nihyt]\ngvcskirmg-gerhc-jmrergmrk-672[lrzta]\nxmrrq-uzgugdslw-jwsuimakalagf-502[agulm]\nshoewudys-hqrryj-tulubefcudj-530[ixkdy]\nmrxivrexmsrep-hci-wxsveki-230[miwqn]\ntmrszakd-bgnbnkzsd-otqbgzrhmf-599[qjfny]\nrwcnawjcrxwju-kdwwh-fxatbqxy-355[jezwy]\nhjgbwuladw-tmffq-ogjckzgh-528[gnlzr]\nlxuxaodu-lxwbdvna-pajmn-ajkkrc-dbna-cnbcrwp-511[umnsy]\nnsyjwsfyntsfq-idj-jslnsjjwnsl-619[ywpco]\nubhatstkwhnl-ktuubm-mktbgbgz-761[btkug]\nlhkhszqx-fqzcd-bgnbnkzsd-dmfhmddqhmf-781[bdnsk]\nvehmsegxmzi-ikk-vieguymwmxmsr-854[pnkle]\nudskkaxawv-jsttal-esfsywewfl-528[sawef]\njxdkbqfz-avb-cfkxkzfkd-887[kfbdx]\njyddc-jpsaiv-gsrxemrqirx-386[rdijs]\ntagzsrsjvgmk-wyy-umklgewj-kwjnauw-606[wgjka]\nwyvqljapsl-ihzrla-huhsfzpz-409[znhcm]\njvuzbtly-nyhkl-zjhclunly-obua-jbzavtly-zlycpjl-331[lyjzb]\ngvaaz-sbejpbdujwf-gmpxfs-vtfs-uftujoh-467[tsogk]\naczupnetwp-nsznzwlep-cplnbftdtetzy-535[nptze]\ngifavtkzcv-vxx-jrcvj-815[vcjxa]\nytu-xjhwjy-uqfxynh-lwfxx-uzwhmfxnsl-255[yzalu]\neqttqukxg-ecpfa-eqcvkpi-cpcnauku-440[zotsy]\nncjzrpytn-nlyoj-nzletyr-nzyeltyxpye-639[zhytj]\nbgmxkgtmbhgte-lvtoxgzxk-angm-phkdlahi-605[nyzfq]\nytu-xjhwjy-xhfajsljw-mzsy-qfgtwfytwd-801[rewpl]\ngpsxdprixkt-rwdrdapit-prfjxhxixdc-349[qrskt]\nojk-nzxmzo-kgvnodx-bmvnn-hvivbzhzio-629[cvkyu]\nktwbhtvmbox-unggr-ybgtgvbgz-267[nbjvs]\nwdjcvuvmyjpn-nxvqzibzm-cpio-kpmxcvndib-109[tndsr]\nfroruixo-gbh-zrunvkrs-439[roubf]\noazegyqd-sdmpq-otaoaxmfq-fdmuzuzs-352[admoq]\nfruurvlyh-fdqgb-sxufkdvlqj-699[mynfj]\nvotubcmf-qmbtujd-hsbtt-efqmpznfou-441[wznfd]\nemixwvqhml-akidmvomz-pcvb-abwziom-928[gwxum]\nqcbgiasf-ufors-foppwh-sbuwbssfwbu-506[sbfuw]\nmrxivrexmsrep-fyrrc-pskmwxmgw-100[pmxwc]\nnsyjwsfyntsfq-uqfxynh-lwfxx-uzwhmfxnsl-125[bwtze]\nkwtwznct-kpwkwtibm-nqvivkqvo-928[kwtvi]\nlahxpnwrl-ouxfna-vjwjpnvnwc-953[nwajl]\nydjuhdqjyedqb-hqrryj-ixyffydw-114[cwzyi]\nrgndvtcxr-snt-igpxcxcv-661[uqvtr]\nbgmxkgtmbhgte-pxtihgbsxw-vahvhetmx-tvjnblbmbhg-371[bghtm]\npwcvonofrcig-tzcksf-fsoqeiwgwhwcb-428[swzyd]\nyaxsnlcrun-ajkkrc-bqryyrwp-641[ycnxl]\njef-iushuj-hqrryj-bqrehqjeho-738[zaytn]\nbdavqofuxq-bxmefuo-sdmee-xmnadmfadk-352[dmaef]\nqcffcgwjs-qobrm-rsdzcmasbh-350[mezyn]\njxdkbqfz-yxphbq-tlohpelm-289[wfvbo]\nhdgdovmt-bmvyz-wvnfzo-yzndbi-915[dvzbm]\nhqcfqwydw-sxesebqju-vydqdsydw-712[smhbn]\nqfmcusbwq-qobrm-qcohwbu-zcuwghwqg-636[qwbcu]\njvsvymbs-msvdly-jvuahputlua-955[vsuaj]\nhqcfqwydw-rkddo-huiuqhsx-218[dhquw]\nshoewudys-uww-jhqydydw-816[jysaf]\ndyz-combod-zvkcdsm-qbkcc-dbksxsxq-562[cdbks]\ntcrjjzwzvu-treup-tfrkzex-rercpjzj-217[fewxh]\npynffvsvrq-cynfgvp-tenff-grpuabybtl-481[fnpvy]\nyhtwhnpun-jyfvnlupj-wshzapj-nyhzz-huhsfzpz-773[zyogh]\nbnqqnrhud-bzmcx-lzqjdshmf-443[jmvdf]\nyrwxefpi-glsgspexi-hitevxqirx-282[bzvyj]\niuxxuyobk-hgyqkz-zkinturume-540[ukixy]\ngpsxdprixkt-rpcsn-prfjxhxixdc-271[ewstq]\nvrurcjah-pajmn-ouxfna-anlnrerwp-615[qsfhg]\nmrxivrexmsrep-tpewxmg-kveww-hiwmkr-854[votlz]\nirgyyolokj-ixeumktoi-jek-rghuxgzuxe-904[egiko]\ndsxxw-zyqicr-pcacgtgle-912[swjtv]\nyhkpvhjapcl-kfl-ylhjxbpzpapvu-955[phlaj]\ngsrwyqiv-kvehi-tpewxmg-kveww-hitevxqirx-724[mnsyt]\nmuqfedyput-rkddo-vydqdsydw-998[mlqhr]\nykhknbqh-ywjzu-iwngapejc-628[hjknw]\nuwtojhynqj-gzssd-ywfnsnsl-619[snjwy]\nemixwvqhml-kpwkwtibm-zmkmqdqvo-148[mkqwi]\nupv-uvjzxe-347[uvejp]\ncqwdujys-ryexqpqhteki-rkddo-skijecuh-iuhlysu-738[uyvln]\nfydelmwp-nsznzwlep-dezclrp-379[elpzd]\nyknnkoera-fahhuxawj-wymqeoepekj-914[kwucf]\nhwbba-vqr-ugetgv-lgnnadgcp-ugtxkegu-908[guabe]\nxqvwdeoh-ixccb-udeelw-fxvwrphu-vhuylfh-803[heuvw]\nxekdwvwnzkqo-acc-iwjwcaiajp-784[mswzt]\nrdchjbtg-vgpst-qphzti-jhtg-ithixcv-609[thgic]\ncqwdujys-vbemuh-iqbui-608[ubiqc]\nhtsxzrjw-lwfij-gfxpjy-rfsfljrjsy-489[jfrsl]\nrtqlgevkng-dcumgv-wugt-vguvkpi-362[gvukt]\noxaflxzqfsb-mixpqfz-doxpp-zrpqljbo-pbosfzb-185[pbfox]\nlqwhuqdwlrqdo-hjj-sxufkdvlqj-569[qdjlh]\nwihmogyl-aluxy-wuhxs-wiuncha-nywbhifias-994[ztysn]\nhwbba-oknkvcta-itcfg-dwppa-tgugctej-492[tacgb]\nmybbycsfo-oqq-wkxkqowoxd-120[oqbkw]\ntyepcyletzylw-dnlgpyrpc-sfye-xlcvpetyr-249[xawqz]\nhjgbwuladw-tmffq-ugflsafewfl-684[flwag]\nsbnqbhjoh-kfmmzcfbo-bobmztjt-493[jnism]\nykjoqian-cnwza-lhwopey-cnwoo-zarahkliajp-602[ihrlb]\npynffvsvrq-fpniratre-uhag-erfrnepu-585[kwurl]\nvetllbybxw-utldxm-mxvaghehzr-787[lxbeh]\nktfitzbgz-lvtoxgzxk-angm-nlxk-mxlmbgz-787[gxzkl]\nemixwvqhml-rmttgjmiv-tijwzibwzg-876[tszyl]\nesyfwlau-udskkaxawv-hdsklau-yjskk-ksdwk-658[ksadu]\njsvagsulanw-tskcwl-jwuwanafy-216[oklsn]\nwfummczcyx-mwupyhayl-bohn-xymcah-552[xcazi]\ntbxmlkfwba-oxyyfq-xkxivpfp-705[xfbkp]\nytu-xjhwjy-rflsjynh-uqfxynh-lwfxx-ijuqtdrjsy-853[ztoub]\ncvabijtm-jiasmb-tijwzibwzg-564[qatln]\njef-iushuj-uww-ixyffydw-816[ptbea]\nzntargvp-fpniratre-uhag-svanapvat-715[dnmgz]\nmvydjvxodqz-zbb-jkzmvodjin-343[fxmnr]\nxlrypetn-nlyoj-dlwpd-873[ldnpy]\njrncbavmrq-pnaql-pbngvat-ybtvfgvpf-117[hgwjo]\nguahyncw-dyffsvyuh-uhufsmcm-786[ufhyc]\nide-htrgti-rpcsn-rdpixcv-igpxcxcv-115[ciprx]\nnwilwcejc-ydkykhwpa-qoan-paopejc-628[acpwe]\nudpsdjlqj-sodvwlf-judvv-oderudwrub-673[dujvl]\nxekdwvwnzkqo-lhwopey-cnwoo-zarahkliajp-966[zdklq]\nixccb-iorzhu-xvhu-whvwlqj-803[emzxn]\ngpbepvxcv-gpqqxi-prfjxhxixdc-297[utzsx]\nzntargvp-wryylorna-fuvccvat-871[dxepl]\njvyyvzpcl-ipvohghykvbz-yhiipa-yljlpcpun-149[aupdo]\nlzfmdshb-okzrshb-fqzrr-lzmzfdldms-651[ndpcm]\nkrxqjijamxdb-bljenwpna-qdwc-mnyuxhvnwc-381[njwxa]\napuut-xviyt-yzkvmohzio-395[iotuv]\nrzvkjiduzy-kgvnodx-bmvnn-mzxzdqdib-187[tayqb]\npkl-oaynap-xwogap-owhao-888[zlbay]\nynukcajey-nwxxep-paydjkhkcu-394[kyace]\nfnjyxwrinm-ouxfna-mnbrpw-771[nfmrw]\nlejkrscv-tfcfiwlc-irsszk-nfibjyfg-399[fcisj]\ndwbcjkun-ljwmh-anlnrerwp-589[nwjlr]\nhdgdovmt-bmvyz-ojk-nzxmzo-wpiit-omvdidib-291[nmqdz]\nnwzekwypera-xwogap-hwxknwpknu-810[wknpa]\nhtwwtxnaj-ojqqdgjfs-wjxjfwhm-567[jwfhq]\nynukcajey-zua-lqnydwoejc-420[xqrgw]\npelbtravp-cynfgvp-tenff-npdhvfvgvba-559[vfpna]\nibghopzs-foppwh-aobousasbh-142[ranfu]\nqxdwpopgsdjh-tvv-rdcipxcbtci-713[wscpi]\nvkppo-sbqiiyvyut-vbemuh-husuylydw-452[uyvbh]\nlqwhuqdwlrqdo-vfdyhqjhu-kxqw-orjlvwlfv-699[qlwdh]\ntcrjjzwzvu-gcrjkzt-xirjj-vexzevvizex-113[gusom]\nwsvsdkbi-qbkno-lexxi-kmaescsdsyx-614[mnoyt]\nkmjezxodgz-xviyt-xjvodib-jkzmvodjin-681[jdiov]\nkgjgrypw-epybc-kyelcrga-njyqrga-epyqq-asqrmkcp-qcptgac-990[cgpqy]\ntagzsrsjvgmk-hdsklau-yjskk-xafsfuafy-736[sakfg]\niwcjapey-xqjju-wymqeoepekj-472[wshmz]\nckgvutofkj-xghhoz-zxgototm-618[dapcq]\nexcdklvo-bkllsd-zebmrkcsxq-692[sdyzv]\nugdgjxmd-jsttal-ogjckzgh-320[nxksp]\ndmbttjgjfe-gmpxfs-fohjoffsjoh-675[emswj]\nesyfwlau-wyy-kwjnauwk-762[zfkst]\nhtsxzrjw-lwfij-gzssd-xytwflj-359[jswfl]\nbnmrtldq-fqzcd-bzmcx-bnzshmf-cdozqsldms-157[rchap]\nenqvbnpgvir-wryylorna-hfre-grfgvat-247[rgnva]\nrzvkjiduzy-mvwwdo-hvivbzhzio-629[vzidh]\nrgllk-omzpk-ymzmsqyqzf-742[ytshk]\nwyvqljapsl-kfl-shivyhavyf-175[lvyaf]\nzloolpfsb-molgbzqfib-oxyyfq-absbilmjbkq-731[rdypn]\nwlqqp-srjbvk-glityrjzex-399[jlqrb]\nfoadouwbu-qvcqczohs-hsqvbczcum-402[coqub]\ngsrwyqiv-kvehi-wgezirkiv-lyrx-wlmttmrk-334[dxqri]\napwmeclga-afmamjyrc-amlryglkclr-470[dvjwq]\namjmpdsj-aylbw-amyrgle-bcqgel-756[fmsjn]\npbybeshy-sybjre-ynobengbel-507[beyns]\njchipqat-rpcsn-hwxeexcv-505[yozns]\nexcdklvo-nio-bomosfsxq-458[bhmlt]\noaxadrgx-ngzzk-ymzmsqyqzf-534[eqjfa]\najyqqgdgcb-zsllw-umpiqfmn-262[sdmlk]\nwkqxodsm-lexxi-cobfsmoc-510[tpnbi]\ntcfkqcevkxg-ecpfa-eqcvkpi-octmgvkpi-986[ckepv]\npbybeshy-onfxrg-qrcyblzrag-845[bryga]\nrdggdhxkt-hrpktcvtg-wjci-gtrtxkxcv-479[tgckr]\nwillimcpy-jfumncw-alumm-lywycpcha-500[utskn]\nqyujihctyx-luxciuwncpy-yaa-mbcjjcha-942[tzusp]\npelbtravp-pnaql-fgbentr-585[pabel]\njef-iushuj-vbemuh-tuiywd-140[jvndh]\nrwcnawjcrxwju-kjbtnc-mnyuxhvnwc-355[cnwjr]\ndszphfojd-tdbwfohfs-ivou-ufdiopmphz-285[dfohp]\nuqtqbizg-ozilm-kivlg-kwibqvo-ewzsapwx-538[iqwzb]\nnjmjubsz-hsbef-cbtlfu-bobmztjt-649[dtsjy]\nzlilocri-zxkav-zlxqfkd-pefmmfkd-887[zijtp]\niwcjapey-ydkykhwpa-oanreyao-576[jfnpy]\npybgmyargtc-zgmfyxypbmsq-zyqicr-mncpyrgmlq-600[gzfir]\nhoungfgxjuay-yigbktmkx-natz-ygrky-228[gykan]\nlnkfaypeha-zua-odellejc-680[gmnlj]\nvhglnfxk-zktwx-cxeeruxtg-kxlxtkva-319[xkteg]\nwfintfhynaj-gzssd-qfgtwfytwd-541[mztfn]\namlqskcp-epybc-aylbw-nspafyqgle-886[alpyb]\niuruxlar-pkrrehkgt-ygrky-774[tsflj]\nxtwtelcj-rclop-clmmte-opgpwzaxpye-145[tskxr]\nbqvvu-ywjzu-ykwpejc-hwxknwpknu-862[wkujn]\nenqvbnpgvir-zntargvp-cynfgvp-tenff-ybtvfgvpf-585[vfngp]\nrzvkjiduzy-xviyt-xjvodib-xjiovdihzio-967[pjzrk]\nnjmjubsz-hsbef-sbnqbhjoh-cvooz-pqfsbujpot-623[bjosh]\nzixppfcfba-mixpqfz-doxpp-zlkqxfkjbkq-653[pfxkq]\nhdgdovmt-bmvyz-kgvnodx-bmvnn-rjmfncjk-239[rpovu]\nhdgdovmt-bmvyz-xviyt-yzndbi-109[pdslu]\nxjinphzm-bmvyz-kgvnodx-bmvnn-vivgtndn-525[nvmbd]\neqnqthwn-eqttqukxg-hnqygt-rwtejcukpi-544[qteng]\nzvyvgnel-tenqr-sybjre-grpuabybtl-793[lyfvq]\ntcorcikpi-ecpfa-eqcvkpi-ugtxkegu-596[teibn]\nnwzekwypera-fahhuxawj-lqnydwoejc-810[mszph]\nmhi-lxvkxm-cxeeruxtg-kxvxbobgz-605[palbn]\nwfummczcyx-jlidywncfy-vumeyn-mylpcwym-838[ijqrb]\nfhezusjybu-zubboruqd-cqdqwucudj-374[ubdqc]\nkgjgrypw-epybc-aylbw-amyrgle-qcptgacq-314[mjlic]\ntcfkqcevkxg-dwppa-ucngu-362[trzmu]\noazegyqd-sdmpq-gzefmnxq-eomhqzsqd-tgzf-qzsuzqqduzs-560[dmrkq]\njlidywncfy-vohhs-xypyfijgyhn-110[yhfij]\nftzgxmbv-lvtoxgzxk-angm-hixktmbhgl-163[gxmtb]\nxgjougizobk-vrgyzoi-mxgyy-cuxqynuv-644[yntxg]\nyknnkoera-lhwopey-cnwoo-odellejc-524[qypjt]\neza-dpncpe-upwwjmply-zapcletzyd-769[pezac]\ncvabijtm-ntwemz-zmikycqaqbqwv-564[mqabc]\nirgyyolokj-kmm-rghuxgzuxe-410[gkmor]\nahngzyzqcntr-idkkxadzm-sdbgmnknfx-807[ndkza]\nsurmhfwloh-fkrfrodwh-pdqdjhphqw-829[myflz]\nelrkdcdugrxv-edvnhw-xvhu-whvwlqj-387[mhtue]\nsbejpbdujwf-xfbqpojafe-ezf-mphjtujdt-155[tqslv]\nshoewudys-rkddo-tuiywd-686[sntpq]\nqcffcgwjs-dzoghwq-ufogg-igsf-hsghwbu-350[psevy]\nibghopzs-qobrm-qcohwbu-zopcfohcfm-740[obchf]\natyzghrk-vrgyzoi-mxgyy-sgtgmksktz-150[tjpiv]\nluxciuwncpy-dyffsvyuh-nluchcha-994[cuhyf]\nvcibutulxiom-xsy-uwkocmcncih-214[ciumo]\nvkppo-rkddo-cqdqwucudj-140[dckop]\nftzgxmbv-vtgwr-kxlxtkva-163[tvxgk]\njlidywncfy-vumeyn-womnigyl-mylpcwy-682[ylmnw]\nmtzslklcozfd-nlyoj-nzletyr-qtylyntyr-639[xswlz]\nixccb-fkrfrodwh-fxvwrphu-vhuylfh-283[fhrcu]\nykjoqian-cnwza-oywrajcan-dqjp-qoan-paopejc-212[tsrfk]\nyhkpvhjapcl-yhiipa-jbzavtly-zlycpjl-617[ftaes]\nqmpmxevc-kvehi-wgezirkiv-lyrx-xvemrmrk-516[emrvi]\nfmsledevhsyw-veffmx-wivzmgiw-204[efmvw]\nzlkprjbo-doxab-zxkav-zlxqfkd-obxznrfpfqflk-237[rqgnd]\nksodcbwnsr-qobrm-qcohwbu-aobousasbh-142[bosac]\nyrwxefpi-glsgspexi-qevoixmrk-828[atyoc]\ndlhwvupglk-wshzapj-nyhzz-klzpnu-877[fbewu]\nbjfutsneji-idj-hzxytrjw-xjwanhj-359[wyrxt]\nzsxyfgqj-bjfutsneji-hfsid-htfynsl-zxjw-yjxynsl-229[jsfyn]\npualyuhapvuhs-ibuuf-klwsvftlua-643[ualfh]\nyknnkoera-ydkykhwpa-klanwpekjo-420[kanye]\niehepwnu-cnwza-ydkykhwpa-zaoecj-420[pozyv]\nftzgxmbv-ktuubm-mxvaghehzr-605[mbght]\ngntmfefwitzx-xhfajsljw-mzsy-ywfnsnsl-983[woefn]\nxmtjbzidx-wpiit-ncdkkdib-863[idbkt]\nktiaaqnqml-uqtqbizg-ozilm-kpwkwtibm-ivitgaqa-850[ywdzl]\ndyz-combod-sxdobxkdsyxkv-mkxni-wkxkqowoxd-224[isamh]\nnsyjwsfyntsfq-rnqnyfwd-lwfij-kqtbjw-uzwhmfxnsl-151[roxtn]\nykjoqian-cnwza-xqjju-nayaerejc-524[yvwax]\nixccb-iorzhu-ilqdqflqj-569[fcjsy]\novbunmneqbhf-ohaal-qrfvta-819[abfhn]\nglrcplyrgmlyj-zyqicr-pcyaosgqgrgml-626[glryc]\najyqqgdgcb-bwc-ylyjwqgq-262[qgybc]\nfhezusjybu-rkddo-bewyijysi-608[ybdei]\naflwjfslagfsd-kusnwfywj-zmfl-xafsfuafy-632[wltdc]\niuxxuyobk-lruckx-vaxingyotm-644[xuiko]\njyfvnlupj-kfl-thyrlapun-773[lfjnp]\neqpuwogt-itcfg-tcfkqcevkxg-dcumgv-qrgtcvkqpu-934[ionzm]\nhqcfqwydw-sqdto-seqjydw-bqrehqjeho-998[qdehw]\nxst-wigvix-ikk-wivzmgiw-724[rtszg]\ntinnm-pibbm-zcuwghwqg-766[mfgbn]\nvkppo-rqiauj-cqdqwucudj-348[qucdj]\nbnmrtldq-fqzcd-ahngzyzqcntr-atmmx-dmfhmddqhmf-989[mdqfh]\nvkrhzxgbv-unggr-tgterlbl-319[tsrkm]\nwihmogyl-aluxy-wuhxs-uhufsmcm-526[uhmls]\nnzydfxpc-rclop-awldetn-rcldd-pyrtyppctyr-951[pcdry]\negdytrixat-eaphixr-vgphh-pcpanhxh-921[hpaxe]\nnwzekwypera-lhwopey-cnwoo-hkceopeyo-654[eowpy]\nzovldbkfz-zlkprjbo-doxab-zxkav-ixyloxqlov-367[olxzb]\nlgh-kwujwl-xmrrq-kusnwfywj-zmfl-hmjuzskafy-372[gmait]\nipvohghykvbz-jhukf-ylzlhyjo-357[awkcb]\ndmybmsuzs-otaoaxmfq-dqmocgueufuaz-976[muaod]\nzbytomdsvo-bkllsd-cdybkqo-796[eufzt]\nsbqiiyvyut-fbqijys-whqii-iqbui-998[ebfqa]\nqyujihctyx-wbiwifuny-guleyncha-838[ejitg]\nikhcxvmbex-unggr-kxvxbobgz-683[ejuzo]\nhafgnoyr-ohaal-jbexfubc-923[bjmzn]\nshmml-wryylorna-genvavat-455[almnr]\nyknnkoera-xqjju-klanwpekjo-420[empdo]\nupq-tfdsfu-kfmmzcfbo-efwfmpqnfou-415[nmfed]\nxcitgcpixdcpa-rdchjbtg-vgpst-hrpktcvtg-wjci-stepgibtci-557[ctgip]\nfydelmwp-nsznzwlep-opgpwzaxpye-769[pewzl]\nglrcplyrgmlyj-cee-pcqcypaf-548[ymzlj]\nxmtjbzidx-wpiit-xjiovdihzio-265[ztyda]\nrwcnawjcrxwju-ljwmh-mnbrpw-901[wjrcm]\nwlqqp-tyftfcrkv-ivtvzmzex-841[tvfqz]\nthnulapj-wshzapj-nyhzz-zopwwpun-669[pzhnw]\nbpvctixr-rdggdhxkt-hrpktcvtg-wjci-pcpanhxh-401[chptg]\neza-dpncpe-awldetn-rcldd-dlwpd-743[delpa]\npbybeshy-sybjre-npdhvfvgvba-299[bvyeh]\nqmpmxevc-kvehi-jpsaiv-viwievgl-802[viemp]\njrncbavmrq-pnaql-pbngvat-qrcyblzrag-715[arbnq]\nugjjgkanw-wyy-kzahhafy-736[clxvm]\nmwupyhayl-bohn-nluchcha-682[hacln]\nqjopwxha-xwogap-ykjpwejiajp-108[jpawo]\navw-zljyla-jhukf-huhsfzpz-175[hzafj]\nlzfmdshb-okzrshb-fqzrr-cdoknxldms-573[olwsf]\ncqwdujys-sbqiiyvyut-uww-iuhlysui-426[cwfuy]\nyaxsnlcrun-ljwmh-bqryyrwp-901[rylnw]\ncebwrpgvyr-pelbtravp-enoovg-znantrzrag-455[raegn]\nnbhofujd-qmbtujd-hsbtt-efwfmpqnfou-389[fbtud]\npynffvsvrq-pnaql-pbngvat-ynobengbel-507[nmyvz]\nltpedcxots-gpqqxi-ldgzhwde-739[bkapm]\nnglmtuex-vahvhetmx-wxiehrfxgm-527[zwksp]\nkgjgrypw-epybc-aylbw-amyrgle-qyjcq-626[ygabc]\nyflexwxoalrp-avb-abmilvjbkq-445[siqmz]\njshzzpmplk-kfl-klclsvwtlua-331[lkpsz]\nujoon-eaphixr-vgphh-prfjxhxixdc-193[hyzjx]\ndfcxsqhwzs-qobrm-zcuwghwqg-168[qwcgh]\nbqvvu-ydkykhwpa-klanwpekjo-966[kapvw]\naoubshwq-pibbm-kcfygvcd-740[wnucy]',
					_1: {
						ctor: '::',
						_0: 'abbhdwsy',
						_1: {
							ctor: '::',
							_0: 'cmezkqgn\nnmzrgcft\nydpndcps\nzjihhows\nkvptxsrx\nubbvugwq\npclcquhl\nrtddzpes\ngfkylkvo\ncpxpjjme\nqqntjofm\ntnvmqrik\ncczmxxag\nikbrgpjh\nlpeohbro\nsgdidbgw\napjhovfs\nmiwqgpmr\nigkccbxe\ndcfpfkdv\nneaxgnpr\nxjlnhgwz\nhbwdbtmt\njaahaztu\nxdhkxiwj\nkbcnydre\nzygzcjxg\npnhlsbyu\ngpkfcakg\nvlpebsme\nfhivcwnn\navscujyu\ntckpnxnn\nvhtaizda\nvghhmhuy\ndtzhrwcw\nqhbcdaxx\nkdoadrvh\nyrjzipbd\nweqfqmqr\nzlkaiefc\nzziwfitz\nhfdvzpol\nopialtmr\nwgbarxig\ngguytyxk\ngwvaqisb\nvybedyip\ncbcdebwm\ntwoqbnis\nitrspsmt\ncqvjpfou\navhpvkbz\nxozehrwd\nqizmzubk\nhpyiulwy\nclmrwgdt\nuruutjhx\npyvkmpxk\nwpjfzzst\nhjxjjkup\nmdtlnvab\ntqwnjufv\nnlaxmbxc\nnyetqfpn\nnmapoequ\naozqvnbx\nawuopxxj\njjamjzdr\nxsgnpwrv\nodpbdulf\nnnpddykk\nfwkqbeeq\nrmpyqcrr\nnnrbqymd\nadvolplo\nxfwzojqb\ndlxozmgp\nmehtypai\nqgxmpmza\ncyflmzcf\ndrilfbik\nhsrkwohm\nlzdcksvs\nxtqiuyon\naatvfuvn\ntgdwdznm\nsrlndtlz\nkcdtqqov\nrjjwcfpr\nsqmwnyjj\nspfagdkw\nffqrocvz\nfdncyaef\ndoymrkhy\nnagivkzc\nylvmvlvo\nyqnpiqnx\nyqiuccji\nswugswxs\nwlfcvtms\nbplwnlqh\ndyqqbiop\nugxdfwnu\nactfbdnl\nhafvcdjm\nuxlvddgb\njimpqraf\noovjqvmc\nniixikhh\nuamcczvl\niqyhtphk\nhmgnaqfa\nanptkatn\ntaslmdqh\nhrsdlgth\ntidxkojm\nbozyplbl\nviyiykes\nbqttiowc\nfdygoexj\nyxiqrabo\nhoqmzyap\nqrdjlssb\nkpoknmcl\nwmfbbpoz\nxyfmwzrc\nekgikzyt\nfurxwelu\ngtfoyquj\nxhtkpgnb\npqwfaoeh\nkgutwopd\ngmsrhxhp\nyfriofga\nkjulfqdc\nanyrvwxv\nreuufyff\nrhhuhyku\nmuwxqimh\nlmmesfgq\nbuklvija\nnrqemlud\nwaggxokb\ndmmtiifd\nkgawgnsa\npvwrwdhz\nmboaagdf\ntugpycjc\nyrrurffl\nxnpptcxi\nwynqznnj\npecxtzem\nqsmjkvvd\ngbosyfyx\ndckxdlle\noyuucewm\nrvzinbwp\nbwdsapew\nqacnmkst\ndunstuov\ngfrmztat\npsehmndx\nkrhyzbag\ntrxayqjv\nddhrarzx\nmsnjiwaf\nznjklkrs\ngzhgcuqn\neoivvakl\nekjbelae\noxvbtsmk\nmwfqyskr\ntihtgxtf\nhldkxeuc\nnnawdxvy\neuemeepz\nibnuhhex\nojwihmnv\ncfpezewj\nvrxjrwia\nwgmyafnj\npnrsmxka\nksuwbzlt\nuwkupngv\njdajpsal\ntbufcuza\njjgptlxn\nhxoulqig\ngieqsttk\nfwjyxnaq\npmfdifiq\nqcgjfmsh\nbnzqevtw\nzlosluzk\npyfrslkb\nivzxjsgx\nwahqmige\nuhvsplzs\nqaatujkd\ntaryjkox\njwdwisfv\ndtwhlvuv\nlwlwbjee\nwopsiktn\niojihkrw\npwmqgwpk\nkepvgmcd\ndqgupbhg\nsrofdewh\nntijingz\nosixtaku\nisacbsnl\ntxtaxccj\nuuqanmcw\nnsuogfzt\nyktybcsy\ncsqjvxog\nrrjygfmc\neftdwemr\nuxbswaep\nzghswtrf\nfhlxbray\njulloyea\nbsxwmvfv\nkzatuvcu\nmnymrdpq\nidejsnhx\nkdbpzapz\ntzjefanj\nottzlwxh\nmifokhqj\nlxxbtzjr\nwjcblnsd\nsiiozsqc\niujapalx\nofsvvyuy\nzbgpxvrb\naqbilxlp\nncobthcc\nsflihopk\npxwtiwam\nnmgzdpyj\nnhjhaezr\nweihbqyp\npkpnbhxp\ndlrelmop\nmjbvnjuq\nqntmdrey\nhtiluzbi\nfingzxbe\nmnekisyu\nynfcmhzd\nvdzoljfg\nwfmscpvw\nefvyjhux\ngvfkaxjq\nrkmkahxl\nvhqijllu\nkkjpwxlq\nlondfadk\nohsxywdq\nznstqcbb\nqtazxfoi\njdqwiadz\nmumicrid\nuhwfytgm\nsrqofgqp\ngtlqqspw\nkxnkrcln\naycqjkay\nyvangrcm\ntpokdbwt\nhmfqugbw\nqoymvotr\nicjendxu\nuqsvumij\nbqkqoeul\nriarnbdv\nzwlltddu\nizcmngof\nlawuhjjj\nfdtnicju\niizykequ\nlwrfolub\nrknrbikc\nyvogoydm\nbogzdkiw\nobnhuoxn\nlzzpupsk\nnuefyzzr\nazghigtg\nmkyduyug\nmnteeioi\nyhqbtwyx\neaojxpwy\nhbbxehvr\nomdkihmb\nhbcijcio\nsettptzw\nbabyhhhe\ncdlexgrs\ncwrdtzjk\nxvtwjacw\nlxeykife\nszogbxgb\nggxlgisl\nkbmrnfro\nioervjsx\npfkodypz\nojgbokwc\njvykzhzc\ncmigvhio\nwwiowvyo\nigwtrxhe\nobawztja\nyyazfxks\ngfqqttue\nczmvgttl\naljlhlyo\nzczpqnzb\nruofwgrx\nbhemgvlr\nyzsulgck\neixzpfkh\ncbejkdrs\nqcsnnfht\nryvlmbiz\nnfswleyf\nxtoxoitk\nysfgwpmy\nzsnapbrq\nolqagygt\nzmtyqfvd\nztybusgn\nzsydzdnl\nfkbvfvsq\ngwdjudok\njuzbnhfe\napivbufk\nozxgeeqa\nyvyvuvxh\nkexcesza\ngqefjmed\nhqyolehg\nmluggzqh\ngkpjfkhg\nbmvxtrci\neuyduveo\navwdogys\njnserfgo\niysfpsns\nnxilicng\nrpclnuwl\nanxroxpu\nfjmenahn\nxngxqxxt\nziwltmcm\nrdizrucj\nwvvwldvq\nblyiqvpw\niklfxllo\ntxueozfv\nwapwemje\nbztthavf\nfkfejluf\niwynejes\nmkwpylhy\npmndxgby\nvhgdvrbv\nfizshysy\nphqddggq\nbosaehqz\nkwsoncrz\npmaethwo\nvalgeqbq\nrcjuatfg\nryaujqvn\nurpgwdyv\ngdefrqbu\njcpfzans\neywcyjer\nxpkacpyo\nxqdukuff\nlmbaxfqi\ntzvnhfms\nosqfwpss\nltgvoipl\nbcorqrzk\nwgccrykp\naaaoczvn\njpbsehyo\nqtfzphwh\nbpiiwzib\ntnxbnwyg\nxruheaca\neoxvahaq\ndzhcleaw\nvwcgptbp\nmmqzjwte\ngpxrndsm\nkdgwktpb\nroqqxgvt\ntceymtaf\npkelkvvi\njqfguroe\nxbrhyuai\njvbizlbh\nhhujmghp\nxxtagkzc\npxtzfvsy\nvlopcrko\nlorhgtfj\neyuzxpjt\njxjbdzrs\njfcuqypt\ndcmbqqln\nstdmubrl\nfkvvwbue\nmqqhkoqd\nlvmnavnr\ngtxksotd\ndyjdydhj\nrknodxpp\nnkrbeqgp\nlzzlxjub\nhfhycqag\nzrhtmjcz\ntetkoiki\naeicawds\nkvverwcb\nvkkmanit\nozzoauql\neqjceipv\nvjeajvzj\nrfbyfkdt\nayudrwvi\nozlumnku\nbbmgldja\ndwpjacmb\nddyqbnzl\njlrdfzef\nquovmsbh\nutposqki\nhowsfhba\nrdddsgwx\nfcdtcqni\nkbhnvmah\ncgpbjquu\nqjhmpyff\nwxkytidy\nssefidnf\nopswmrqz\nzhcskfsp\nhhkqbfon\nuvgdhifc\neoewusji\nxjmylrdx\nfabeoujy\ngzrceopo\nfxsivztv\nveqxwblf\nsacoxlhm\nxongcuef\nlufmhuoi\njuzgavxq\njjwlcfjq\negmnqjqn\nryhlipod\nuagzcjur\nepjngrwa\nfijrzmww\nzihnvpgp\nzjurrctz\nirhnbjjr\nmlrfavaa\ncokssyim\nauwsrcsm\nwrkkttyo\ncmskryli\nmrkpezgq\nehefyaqv\nivsuxdll\ngscbkguh\nbfxberbd\nvihesdxg\nvdbxzltv\nlkoiranw\nqcnefblb\ncfftjwud\nxqpieetw\ncrnrywvn\neepxytfc\ncacfhgnf\nbakhanwy\nlsnlnmrj\nusaurokx\nsjqbyile\nlvcgmrte\nvesupotm\nyeusftiz\nclnjmcit\njhexzuyh\nwtbiuozi\nfsnqljcg\nfxretbsa\nlsagjnhx\njjknskzr\ndllskstv\nvgxhdbyw\nyryqoqgz\nycilkokz\nvfdcsamh\noedmwosl\nvzwfymbu\neqrznqgp\nfevhvwom\nqextbmed\nubdsfkiu\nstvuqrka\nnmcrshqw\nzlfzaxmw\nqzcagqcq\ndjudatbg\nusknomtt\nbusciicd\nwyugburo\nqblpvrxc\nshzawivm\nztgzrklm\nahpxtdmz\nobvuhnlj\nuihsumey\nmircsnyv\nijjhkyjw\ndgxmzhgq\nrqavgasa\nlelkschr\nsvzzvroa\nsevzfvbh\nkgzcpbdj\nwvctsjcp\nkgdrxolj\ntlsksbdi\nycqvhidx\nepcaeqir\nxcrgjgzi\nsnuvvmmy\ncxbxoxvb\nleykoxno\nppvysjob\neubrylie\npxspjeqg\nxbdesmuq\nbfcpktpy\nelyounyn\nniwhwuak\nhukkheui\nueojrjoc\nmktpkpsk\nuxljxoei\nhymwnsrf\nsgyywcqt\nyznoeeft\npuvcmnpe\ndomsvurc\nukbhxndd\nqwlzklcm\nqttwpwdc\nvxljmley\nsjlbsszg\niqobsomn',
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	});

var _user$project$View$renderGithubLink = function (day) {
	var dayPadded = _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$String$length(day),
		1) ? A2(_elm_lang$core$Basics_ops['++'], '0', day) : day;
	return A2(
		_elm_lang$html$Html$a,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$target('_blank'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$href(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'https://github.com/marcospri/adventofcode2016/tree/master/day',
						A2(_elm_lang$core$Basics_ops['++'], dayPadded, '.elm'))),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text('[Github]'),
			_1: {ctor: '[]'}
		});
};
var _user$project$View$renderProblemLink = function (day) {
	return A2(
		_elm_lang$html$Html$a,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$target('_blank'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$href(
					A2(_elm_lang$core$Basics_ops['++'], 'http://adventofcode.com/2016/day/', day)),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(_elm_lang$core$Basics_ops['++'], 'adventofcode.com/2016/day/', day)),
			_1: {ctor: '[]'}
		});
};
var _user$project$View$renderProblem = F2(
	function (_p1, _p0) {
		var _p2 = _p1;
		var _p4 = _p2.problemDay;
		var _p3 = _p0;
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('page-header'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$a,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$href('index.html'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$span,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('glyphicon glyphicon-home'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$h1,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										A2(
											_elm_lang$core$Basics_ops['++'],
											'Solution to day ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(_p4),
												' '))),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$small,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: _user$project$View$renderGithubLink(
													_elm_lang$core$Basics$toString(_p4)),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$span,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text(' '),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: _user$project$View$renderProblemLink(
															_elm_lang$core$Basics$toString(_p4)),
														_1: {ctor: '[]'}
													}
												}
											}),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('panel panel-defaul'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel-heading'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Problem input'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-body'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$pre,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$style(
													{
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'max-height', _1: '300px'},
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(_p2.input),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('panel panel-defaul'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('panel-heading'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$button,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('btn btn-default'),
												_1: {
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(_p3._0),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Solve part 1'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('panel-body'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$pre,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(_p2.solutionPart1),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('panel panel-defaul'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('panel-heading'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$button,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$class('btn btn-default'),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Events$onClick(_p3._1),
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Solve part 2'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$div,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('panel-body'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$pre,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text(_p2.solutionPart2),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});

var _user$project$Main$validPositions = _elm_lang$core$Set$fromList(
	{
		ctor: '::',
		_0: '0',
		_1: {
			ctor: '::',
			_0: '1',
			_1: {
				ctor: '::',
				_0: '2',
				_1: {
					ctor: '::',
					_0: '3',
					_1: {
						ctor: '::',
						_0: '4',
						_1: {
							ctor: '::',
							_0: '5',
							_1: {
								ctor: '::',
								_0: '6',
								_1: {
									ctor: '::',
									_0: '7',
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Main$findHashesPart2 = function (model) {
	findHashesPart2:
	while (true) {
		if (_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Dict$size(model.passwordDict),
			8)) {
			return model;
		} else {
			var currentHash = _sanichi$elm_md5$MD5$hex(
				A2(
					F2(
						function (x, y) {
							return A2(_elm_lang$core$Basics_ops['++'], x, y);
						}),
					model.input,
					_elm_lang$core$Basics$toString(model.index)));
			var passwordChar = A3(_elm_lang$core$String$slice, 6, 7, currentHash);
			var position = A3(_elm_lang$core$String$slice, 5, 6, currentHash);
			if (_elm_lang$core$Native_Utils.eq(
				A3(_elm_lang$core$String$slice, 0, 5, currentHash),
				'00000')) {
				var _p0 = A2(
					_elm_lang$core$Debug$log,
					'Found',
					{ctor: '_Tuple5', _0: currentHash, _1: model.index, _2: model.passwordDict, _3: position, _4: passwordChar});
				if (A2(_elm_lang$core$Set$member, position, _user$project$Main$validPositions) && (!A2(_elm_lang$core$Dict$member, position, model.passwordDict))) {
					var _v0 = _elm_lang$core$Native_Utils.update(
						model,
						{
							index: model.index + 1,
							passwordDict: A3(_elm_lang$core$Dict$insert, position, passwordChar, model.passwordDict)
						});
					model = _v0;
					continue findHashesPart2;
				} else {
					var _v1 = _elm_lang$core$Native_Utils.update(
						model,
						{index: model.index + 1});
					model = _v1;
					continue findHashesPart2;
				}
			} else {
				var _v2 = _elm_lang$core$Native_Utils.update(
					model,
					{index: model.index + 1});
				model = _v2;
				continue findHashesPart2;
			}
		}
	}
};
var _user$project$Main$solverPart2 = function (model) {
	return A2(
		_elm_lang$core$String$join,
		'',
		_elm_lang$core$Dict$values(
			_user$project$Main$findHashesPart2(model).passwordDict));
};
var _user$project$Main$findHashesPart1 = function (model) {
	findHashesPart1:
	while (true) {
		if (_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$String$length(model.password),
			8)) {
			return model;
		} else {
			var currentHash = _sanichi$elm_md5$MD5$hex(
				A2(
					F2(
						function (x, y) {
							return A2(_elm_lang$core$Basics_ops['++'], x, y);
						}),
					model.input,
					_elm_lang$core$Basics$toString(model.index)));
			if (_elm_lang$core$Native_Utils.eq(
				A3(_elm_lang$core$String$slice, 0, 5, currentHash),
				'00000')) {
				var _p1 = A2(
					_elm_lang$core$Debug$log,
					'Found',
					{ctor: '_Tuple3', _0: currentHash, _1: model.index, _2: model.password});
				var _v3 = _elm_lang$core$Native_Utils.update(
					model,
					{
						index: model.index + 1,
						password: A2(
							_elm_lang$core$Basics_ops['++'],
							model.password,
							A3(_elm_lang$core$String$slice, 5, 6, currentHash))
					});
				model = _v3;
				continue findHashesPart1;
			} else {
				var _v4 = _elm_lang$core$Native_Utils.update(
					model,
					{index: model.index + 1});
				model = _v4;
				continue findHashesPart1;
			}
		}
	}
};
var _user$project$Main$solverPart1 = function (model) {
	return _user$project$Main$findHashesPart1(model).password;
};
var _user$project$Main$init = {
	ctor: '_Tuple2',
	_0: {
		problemDay: 5,
		input: A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			A2(_elm_lang$core$Array$get, 4, _user$project$Inputs$problemInputs)),
		solutionPart1: '',
		solutionPart2: '',
		index: 1739528,
		password: '',
		passwordDict: _elm_lang$core$Dict$empty
	},
	_1: _elm_lang$core$Platform_Cmd$none
};
var _user$project$Main$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$none;
};
var _user$project$Main$update = F2(
	function (msg, model) {
		var _p2 = msg;
		if (_p2.ctor === 'Solve') {
			var solution = _elm_lang$core$Basics$toString(
				_user$project$Main$solverPart1(model));
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{solutionPart1: solution}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			var solution = _elm_lang$core$Basics$toString(
				_user$project$Main$solverPart2(model));
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{solutionPart2: solution}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _user$project$Main$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {problemDay: a, input: b, solutionPart1: c, solutionPart2: d, password: e, index: f, passwordDict: g};
	});
var _user$project$Main$Solve2 = {ctor: 'Solve2'};
var _user$project$Main$Solve = {ctor: 'Solve'};
var _user$project$Main$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_user$project$View$renderProblem,
				model,
				{ctor: '_Tuple2', _0: _user$project$Main$Solve, _1: _user$project$Main$Solve2}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$main = _elm_lang$html$Html$program(
	{init: _user$project$Main$init, view: _user$project$Main$view, update: _user$project$Main$update, subscriptions: _user$project$Main$subscriptions})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);


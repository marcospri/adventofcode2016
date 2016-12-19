
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

var _elm_lang$core$Color$fmod = F2(
	function (f, n) {
		var integer = _elm_lang$core$Basics$floor(f);
		return (_elm_lang$core$Basics$toFloat(
			A2(_elm_lang$core$Basics_ops['%'], integer, n)) + f) - _elm_lang$core$Basics$toFloat(integer);
	});
var _elm_lang$core$Color$rgbToHsl = F3(
	function (red, green, blue) {
		var b = _elm_lang$core$Basics$toFloat(blue) / 255;
		var g = _elm_lang$core$Basics$toFloat(green) / 255;
		var r = _elm_lang$core$Basics$toFloat(red) / 255;
		var cMax = A2(
			_elm_lang$core$Basics$max,
			A2(_elm_lang$core$Basics$max, r, g),
			b);
		var cMin = A2(
			_elm_lang$core$Basics$min,
			A2(_elm_lang$core$Basics$min, r, g),
			b);
		var c = cMax - cMin;
		var lightness = (cMax + cMin) / 2;
		var saturation = _elm_lang$core$Native_Utils.eq(lightness, 0) ? 0 : (c / (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)));
		var hue = _elm_lang$core$Basics$degrees(60) * (_elm_lang$core$Native_Utils.eq(cMax, r) ? A2(_elm_lang$core$Color$fmod, (g - b) / c, 6) : (_elm_lang$core$Native_Utils.eq(cMax, g) ? (((b - r) / c) + 2) : (((r - g) / c) + 4)));
		return {ctor: '_Tuple3', _0: hue, _1: saturation, _2: lightness};
	});
var _elm_lang$core$Color$hslToRgb = F3(
	function (hue, saturation, lightness) {
		var normHue = hue / _elm_lang$core$Basics$degrees(60);
		var chroma = (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)) * saturation;
		var x = chroma * (1 - _elm_lang$core$Basics$abs(
			A2(_elm_lang$core$Color$fmod, normHue, 2) - 1));
		var _p0 = (_elm_lang$core$Native_Utils.cmp(normHue, 0) < 0) ? {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 1) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: x, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 2) < 0) ? {ctor: '_Tuple3', _0: x, _1: chroma, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 3) < 0) ? {ctor: '_Tuple3', _0: 0, _1: chroma, _2: x} : ((_elm_lang$core$Native_Utils.cmp(normHue, 4) < 0) ? {ctor: '_Tuple3', _0: 0, _1: x, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 5) < 0) ? {ctor: '_Tuple3', _0: x, _1: 0, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 6) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: 0, _2: x} : {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0}))))));
		var r = _p0._0;
		var g = _p0._1;
		var b = _p0._2;
		var m = lightness - (chroma / 2);
		return {ctor: '_Tuple3', _0: r + m, _1: g + m, _2: b + m};
	});
var _elm_lang$core$Color$toRgb = function (color) {
	var _p1 = color;
	if (_p1.ctor === 'RGBA') {
		return {red: _p1._0, green: _p1._1, blue: _p1._2, alpha: _p1._3};
	} else {
		var _p2 = A3(_elm_lang$core$Color$hslToRgb, _p1._0, _p1._1, _p1._2);
		var r = _p2._0;
		var g = _p2._1;
		var b = _p2._2;
		return {
			red: _elm_lang$core$Basics$round(255 * r),
			green: _elm_lang$core$Basics$round(255 * g),
			blue: _elm_lang$core$Basics$round(255 * b),
			alpha: _p1._3
		};
	}
};
var _elm_lang$core$Color$toHsl = function (color) {
	var _p3 = color;
	if (_p3.ctor === 'HSLA') {
		return {hue: _p3._0, saturation: _p3._1, lightness: _p3._2, alpha: _p3._3};
	} else {
		var _p4 = A3(_elm_lang$core$Color$rgbToHsl, _p3._0, _p3._1, _p3._2);
		var h = _p4._0;
		var s = _p4._1;
		var l = _p4._2;
		return {hue: h, saturation: s, lightness: l, alpha: _p3._3};
	}
};
var _elm_lang$core$Color$HSLA = F4(
	function (a, b, c, d) {
		return {ctor: 'HSLA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$hsla = F4(
	function (hue, saturation, lightness, alpha) {
		return A4(
			_elm_lang$core$Color$HSLA,
			hue - _elm_lang$core$Basics$turns(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(hue / (2 * _elm_lang$core$Basics$pi)))),
			saturation,
			lightness,
			alpha);
	});
var _elm_lang$core$Color$hsl = F3(
	function (hue, saturation, lightness) {
		return A4(_elm_lang$core$Color$hsla, hue, saturation, lightness, 1);
	});
var _elm_lang$core$Color$complement = function (color) {
	var _p5 = color;
	if (_p5.ctor === 'HSLA') {
		return A4(
			_elm_lang$core$Color$hsla,
			_p5._0 + _elm_lang$core$Basics$degrees(180),
			_p5._1,
			_p5._2,
			_p5._3);
	} else {
		var _p6 = A3(_elm_lang$core$Color$rgbToHsl, _p5._0, _p5._1, _p5._2);
		var h = _p6._0;
		var s = _p6._1;
		var l = _p6._2;
		return A4(
			_elm_lang$core$Color$hsla,
			h + _elm_lang$core$Basics$degrees(180),
			s,
			l,
			_p5._3);
	}
};
var _elm_lang$core$Color$grayscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$greyscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$RGBA = F4(
	function (a, b, c, d) {
		return {ctor: 'RGBA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$rgba = _elm_lang$core$Color$RGBA;
var _elm_lang$core$Color$rgb = F3(
	function (r, g, b) {
		return A4(_elm_lang$core$Color$RGBA, r, g, b, 1);
	});
var _elm_lang$core$Color$lightRed = A4(_elm_lang$core$Color$RGBA, 239, 41, 41, 1);
var _elm_lang$core$Color$red = A4(_elm_lang$core$Color$RGBA, 204, 0, 0, 1);
var _elm_lang$core$Color$darkRed = A4(_elm_lang$core$Color$RGBA, 164, 0, 0, 1);
var _elm_lang$core$Color$lightOrange = A4(_elm_lang$core$Color$RGBA, 252, 175, 62, 1);
var _elm_lang$core$Color$orange = A4(_elm_lang$core$Color$RGBA, 245, 121, 0, 1);
var _elm_lang$core$Color$darkOrange = A4(_elm_lang$core$Color$RGBA, 206, 92, 0, 1);
var _elm_lang$core$Color$lightYellow = A4(_elm_lang$core$Color$RGBA, 255, 233, 79, 1);
var _elm_lang$core$Color$yellow = A4(_elm_lang$core$Color$RGBA, 237, 212, 0, 1);
var _elm_lang$core$Color$darkYellow = A4(_elm_lang$core$Color$RGBA, 196, 160, 0, 1);
var _elm_lang$core$Color$lightGreen = A4(_elm_lang$core$Color$RGBA, 138, 226, 52, 1);
var _elm_lang$core$Color$green = A4(_elm_lang$core$Color$RGBA, 115, 210, 22, 1);
var _elm_lang$core$Color$darkGreen = A4(_elm_lang$core$Color$RGBA, 78, 154, 6, 1);
var _elm_lang$core$Color$lightBlue = A4(_elm_lang$core$Color$RGBA, 114, 159, 207, 1);
var _elm_lang$core$Color$blue = A4(_elm_lang$core$Color$RGBA, 52, 101, 164, 1);
var _elm_lang$core$Color$darkBlue = A4(_elm_lang$core$Color$RGBA, 32, 74, 135, 1);
var _elm_lang$core$Color$lightPurple = A4(_elm_lang$core$Color$RGBA, 173, 127, 168, 1);
var _elm_lang$core$Color$purple = A4(_elm_lang$core$Color$RGBA, 117, 80, 123, 1);
var _elm_lang$core$Color$darkPurple = A4(_elm_lang$core$Color$RGBA, 92, 53, 102, 1);
var _elm_lang$core$Color$lightBrown = A4(_elm_lang$core$Color$RGBA, 233, 185, 110, 1);
var _elm_lang$core$Color$brown = A4(_elm_lang$core$Color$RGBA, 193, 125, 17, 1);
var _elm_lang$core$Color$darkBrown = A4(_elm_lang$core$Color$RGBA, 143, 89, 2, 1);
var _elm_lang$core$Color$black = A4(_elm_lang$core$Color$RGBA, 0, 0, 0, 1);
var _elm_lang$core$Color$white = A4(_elm_lang$core$Color$RGBA, 255, 255, 255, 1);
var _elm_lang$core$Color$lightGrey = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$grey = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGrey = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightGray = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$gray = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGray = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightCharcoal = A4(_elm_lang$core$Color$RGBA, 136, 138, 133, 1);
var _elm_lang$core$Color$charcoal = A4(_elm_lang$core$Color$RGBA, 85, 87, 83, 1);
var _elm_lang$core$Color$darkCharcoal = A4(_elm_lang$core$Color$RGBA, 46, 52, 54, 1);
var _elm_lang$core$Color$Radial = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Radial', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Color$radial = _elm_lang$core$Color$Radial;
var _elm_lang$core$Color$Linear = F3(
	function (a, b, c) {
		return {ctor: 'Linear', _0: a, _1: b, _2: c};
	});
var _elm_lang$core$Color$linear = _elm_lang$core$Color$Linear;

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

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

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

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

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

var _evancz$elm_graphics$Native_Element = function()
{


// CREATION

var createNode =
	typeof document === 'undefined'
		?
			function(_)
			{
				return {
					style: {},
					appendChild: function() {}
				};
			}
		:
			function(elementType)
			{
				var node = document.createElement(elementType);
				node.style.padding = '0';
				node.style.margin = '0';
				return node;
			}
		;


function newElement(width, height, elementPrim)
{
	return {
		ctor: 'Element_elm_builtin',
		_0: {
			element: elementPrim,
			props: {
				width: width,
				height: height,
				opacity: 1,
				color: _elm_lang$core$Maybe$Nothing,
				href: '',
				tag: ''
			}
		}
	};
}


// PROPERTIES

function setProps(elem, node)
{
	var props = elem.props;

	var element = elem.element;
	var width = props.width - (element.adjustWidth || 0);
	var height = props.height - (element.adjustHeight || 0);
	node.style.width  = (width | 0) + 'px';
	node.style.height = (height | 0) + 'px';

	if (props.opacity !== 1)
	{
		node.style.opacity = props.opacity;
	}

	if (props.color.ctor === 'Just')
	{
		node.style.backgroundColor = _evancz$elm_graphics$Text$colorToCss(props.color._0);
	}

	if (props.tag !== '')
	{
		node.id = props.tag;
	}

	if (props.href !== '')
	{
		var anchor = createNode('a');
		anchor.href = props.href;
		anchor.style.display = 'block';
		anchor.style.pointerEvents = 'auto';
		anchor.appendChild(node);
		node = anchor;
	}

	return node;
}


// IMAGES

function image(props, img)
{
	switch (img._0.ctor)
	{
		case 'Plain':
			return plainImage(img._3);

		case 'Fitted':
			return fittedImage(props.width, props.height, img._3);

		case 'Cropped':
			return croppedImage(img, props.width, props.height, img._3);

		case 'Tiled':
			return tiledImage(img._3);
	}
}

function plainImage(src)
{
	var img = createNode('img');
	img.src = src;
	img.name = src;
	img.style.display = 'block';
	return img;
}

function tiledImage(src)
{
	var div = createNode('div');
	div.style.backgroundImage = 'url(' + src + ')';
	return div;
}

function fittedImage(w, h, src)
{
	var div = createNode('div');
	div.style.background = 'url(' + src + ') no-repeat center';
	div.style.webkitBackgroundSize = 'cover';
	div.style.MozBackgroundSize = 'cover';
	div.style.OBackgroundSize = 'cover';
	div.style.backgroundSize = 'cover';
	return div;
}

function croppedImage(elem, w, h, src)
{
	var pos = elem._0._0;
	var e = createNode('div');
	e.style.overflow = 'hidden';

	var img = createNode('img');
	img.onload = function() {
		var sw = w / elem._1, sh = h / elem._2;
		img.style.width = ((this.width * sw) | 0) + 'px';
		img.style.height = ((this.height * sh) | 0) + 'px';
		img.style.marginLeft = ((- pos._0 * sw) | 0) + 'px';
		img.style.marginTop = ((- pos._1 * sh) | 0) + 'px';
	};
	img.src = src;
	img.name = src;
	e.appendChild(img);
	return e;
}


// FLOW

function goOut(node)
{
	node.style.position = 'absolute';
	return node;
}
function goDown(node)
{
	return node;
}
function goRight(node)
{
	node.style.styleFloat = 'left';
	node.style.cssFloat = 'left';
	return node;
}

var directionTable = {
	DUp: goDown,
	DDown: goDown,
	DLeft: goRight,
	DRight: goRight,
	DIn: goOut,
	DOut: goOut
};
function needsReversal(dir)
{
	return dir === 'DUp' || dir === 'DLeft' || dir === 'DIn';
}

function flow(dir, elist)
{
	var array = _elm_lang$core$Native_List.toArray(elist);
	var container = createNode('div');
	var goDir = directionTable[dir];
	if (goDir === goOut)
	{
		container.style.pointerEvents = 'none';
	}
	if (needsReversal(dir))
	{
		array.reverse();
	}
	var len = array.length;
	for (var i = 0; i < len; ++i)
	{
		container.appendChild(goDir(render(array[i])));
	}
	return container;
}


// CONTAINER

function toPos(pos)
{
	return pos.ctor === 'Absolute'
		? pos._0 + 'px'
		: (pos._0 * 100) + '%';
}

// must clear right, left, top, bottom, and transform
// before calling this function
function setPos(pos, wrappedElement, e)
{
	var elem = wrappedElement._0;
	var element = elem.element;
	var props = elem.props;
	var w = props.width + (element.adjustWidth ? element.adjustWidth : 0);
	var h = props.height + (element.adjustHeight ? element.adjustHeight : 0);

	e.style.position = 'absolute';
	e.style.margin = 'auto';
	var transform = '';

	switch (pos.horizontal.ctor)
	{
		case 'P':
			e.style.right = toPos(pos.x);
			e.style.removeProperty('left');
			break;

		case 'Z':
			transform = 'translateX(' + ((-w / 2) | 0) + 'px) ';

		case 'N':
			e.style.left = toPos(pos.x);
			e.style.removeProperty('right');
			break;
	}
	switch (pos.vertical.ctor)
	{
		case 'N':
			e.style.bottom = toPos(pos.y);
			e.style.removeProperty('top');
			break;

		case 'Z':
			transform += 'translateY(' + ((-h / 2) | 0) + 'px)';

		case 'P':
			e.style.top = toPos(pos.y);
			e.style.removeProperty('bottom');
			break;
	}
	if (transform !== '')
	{
		addTransform(e.style, transform);
	}
	return e;
}

function addTransform(style, transform)
{
	style.transform       = transform;
	style.msTransform     = transform;
	style.MozTransform    = transform;
	style.webkitTransform = transform;
	style.OTransform      = transform;
}

function container(pos, elem)
{
	var e = render(elem);
	setPos(pos, elem, e);
	var div = createNode('div');
	div.style.position = 'relative';
	div.style.overflow = 'hidden';
	div.appendChild(e);
	return div;
}


function rawHtml(elem)
{
	var html = elem.html;
	var align = elem.align;

	var div = createNode('div');
	div.innerHTML = html;
	div.style.visibility = 'hidden';
	if (align)
	{
		div.style.textAlign = align;
	}
	div.style.visibility = 'visible';
	div.style.pointerEvents = 'auto';
	return div;
}


// TO HTML

function toHtml(element)
{
	return _elm_lang$virtual_dom$Native_VirtualDom.custom(
		_elm_lang$core$Native_List.Nil,
		element,
		implementation
	);
}


// WIDGET IMPLEMENTATION

var implementation = {
	render: render,
	diff: diff
};

function diff(a, b)
{
	var aModel = a.model;
	var bModel = b.model;

	if (aModel === bModel)
	{
		return null;
	}

	return {
		applyPatch: applyPatch,
		data: { a: aModel, b: bModel }
	};
}

function applyPatch(domNode, data)
{
	return updateAndReplace(domNode, data.a, data.b);
}


// RENDER

function render(wrappedElement)
{
	var elem = wrappedElement._0;
	return setProps(elem, makeElement(elem));
}

function makeElement(e)
{
	var elem = e.element;
	switch (elem.ctor)
	{
		case 'Image':
			return image(e.props, elem);

		case 'Flow':
			return flow(elem._0.ctor, elem._1);

		case 'Container':
			return container(elem._0, elem._1);

		case 'Spacer':
			return createNode('div');

		case 'RawHtml':
			return rawHtml(elem);

		case 'Custom':
			return elem.render(elem.model);
	}
}

function updateAndReplace(node, curr, next)
{
	var newNode = update(node, curr, next);
	if (newNode !== node)
	{
		node.parentNode.replaceChild(newNode, node);
	}
	return newNode;
}


// UPDATE

function update(node, wrappedCurrent, wrappedNext)
{
	var curr = wrappedCurrent._0;
	var next = wrappedNext._0;
	var rootNode = node;

	if (curr === next)
	{
		return rootNode;
	}

	if (node.tagName === 'A')
	{
		node = node.firstChild;
	}
	if (curr.element.ctor !== next.element.ctor)
	{
		return render(wrappedNext);
	}
	var nextE = next.element;
	var currE = curr.element;
	switch (nextE.ctor)
	{
		case 'Spacer':
			updateProps(node, curr, next);
			return rootNode;

		case 'RawHtml':
			if(currE.html.valueOf() !== nextE.html.valueOf())
			{
				node.innerHTML = nextE.html;
			}
			updateProps(node, curr, next);
			return rootNode;

		case 'Image':
			if (nextE._0.ctor === 'Plain')
			{
				if (nextE._3 !== currE._3)
				{
					node.src = nextE._3;
				}
			}
			else if (!_elm_lang$core$Native_Utils.eq(nextE, currE)
				|| next.props.width !== curr.props.width
				|| next.props.height !== curr.props.height)
			{
				return render(wrappedNext);
			}
			updateProps(node, curr, next);
			return rootNode;

		case 'Flow':
			var arr = _elm_lang$core$Native_List.toArray(nextE._1);
			for (var i = arr.length; i--; )
			{
				arr[i] = arr[i]._0.element.ctor;
			}
			if (nextE._0.ctor !== currE._0.ctor)
			{
				return render(wrappedNext);
			}
			var nexts = _elm_lang$core$Native_List.toArray(nextE._1);
			var kids = node.childNodes;
			if (nexts.length !== kids.length)
			{
				return render(wrappedNext);
			}
			var currs = _elm_lang$core$Native_List.toArray(currE._1);
			var dir = nextE._0.ctor;
			var goDir = directionTable[dir];
			var toReverse = needsReversal(dir);
			var len = kids.length;
			for (var i = len; i--; )
			{
				var subNode = kids[toReverse ? len - i - 1 : i];
				goDir(updateAndReplace(subNode, currs[i], nexts[i]));
			}
			updateProps(node, curr, next);
			return rootNode;

		case 'Container':
			var subNode = node.firstChild;
			var newSubNode = updateAndReplace(subNode, currE._1, nextE._1);
			setPos(nextE._0, nextE._1, newSubNode);
			updateProps(node, curr, next);
			return rootNode;

		case 'Custom':
			if (currE.type === nextE.type)
			{
				var updatedNode = nextE.update(node, currE.model, nextE.model);
				updateProps(updatedNode, curr, next);
				return updatedNode;
			}
			return render(wrappedNext);
	}
}

function updateProps(node, curr, next)
{
	var nextProps = next.props;
	var currProps = curr.props;

	var element = next.element;
	var width = nextProps.width - (element.adjustWidth || 0);
	var height = nextProps.height - (element.adjustHeight || 0);
	if (width !== currProps.width)
	{
		node.style.width = (width | 0) + 'px';
	}
	if (height !== currProps.height)
	{
		node.style.height = (height | 0) + 'px';
	}

	if (nextProps.opacity !== currProps.opacity)
	{
		node.style.opacity = nextProps.opacity;
	}

	var nextColor = nextProps.color.ctor === 'Just'
		? _evancz$elm_graphics$Text$colorToCss(nextProps.color._0)
		: '';
	if (node.style.backgroundColor !== nextColor)
	{
		node.style.backgroundColor = nextColor;
	}

	if (nextProps.tag !== currProps.tag)
	{
		node.id = nextProps.tag;
	}

	if (nextProps.href !== currProps.href)
	{
		if (currProps.href === '')
		{
			// add a surrounding href
			var anchor = createNode('a');
			anchor.href = nextProps.href;
			anchor.style.display = 'block';
			anchor.style.pointerEvents = 'auto';

			node.parentNode.replaceChild(anchor, node);
			anchor.appendChild(node);
		}
		else if (nextProps.href === '')
		{
			// remove the surrounding href
			var anchor = node.parentNode;
			anchor.parentNode.replaceChild(node, anchor);
		}
		else
		{
			// just update the link
			node.parentNode.href = nextProps.href;
		}
	}
}


// TEXT

function block(align)
{
	return function(text)
	{
		var raw = {
			ctor: 'RawHtml',
			html: _evancz$elm_graphics$Text$toHtmlString(text),
			align: align
		};
		var pos = htmlHeight(0, raw);
		return newElement(pos._0, pos._1, raw);
	};
}

var htmlHeight =
	typeof document !== 'undefined'
		? realHtmlHeight
		: function(a, b) { return _elm_lang$core$Native_Utils.Tuple2(0, 0); };

function realHtmlHeight(width, rawHtml)
{
	// create dummy node
	var temp = document.createElement('div');
	temp.innerHTML = rawHtml.html;
	if (width > 0)
	{
		temp.style.width = width + 'px';
	}
	temp.style.visibility = 'hidden';
	temp.style.styleFloat = 'left';
	temp.style.cssFloat = 'left';

	document.body.appendChild(temp);

	// get dimensions
	var style = window.getComputedStyle(temp, null);
	var w = Math.ceil(style.getPropertyValue('width').slice(0, -2) - 0);
	var h = Math.ceil(style.getPropertyValue('height').slice(0, -2) - 0);
	document.body.removeChild(temp);
	return _elm_lang$core$Native_Utils.Tuple2(w, h);
}


return {
	toHtml: toHtml,

	render: render,
	update: update,
	createNode: createNode,
	newElement: F3(newElement),
	addTransform: addTransform,

	block: block
};

}();


var _evancz$elm_graphics$Text$wrap = F3(
	function (maybeHref, styles, insides) {
		var linkedInsides = function () {
			var _p0 = maybeHref;
			if (_p0.ctor === 'Nothing') {
				return insides;
			} else {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'<a href=\"',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_p0._0,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'\">',
							A2(_elm_lang$core$Basics_ops['++'], insides, '</a>'))));
			}
		}();
		return _elm_lang$core$Native_Utils.eq(styles, '') ? linkedInsides : A2(
			_elm_lang$core$Basics_ops['++'],
			'<span style=\"',
			A2(
				_elm_lang$core$Basics_ops['++'],
				styles,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'\">',
					A2(_elm_lang$core$Basics_ops['++'], linkedInsides, '</span>'))));
	});
var _evancz$elm_graphics$Text$replace = F3(
	function (from, to, str) {
		return A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$All,
			_elm_lang$core$Regex$regex(from),
			function (_p1) {
				return to;
			},
			str);
	});
var _evancz$elm_graphics$Text$toHtmlString = function (text) {
	return A3(_evancz$elm_graphics$Text$toHtmlStringHelp, _elm_lang$core$Maybe$Nothing, '', text);
};
var _evancz$elm_graphics$Text$toHtmlStringHelp = F3(
	function (maybeHref, styles, text) {
		toHtmlStringHelp:
		while (true) {
			var _p2 = text;
			switch (_p2.ctor) {
				case 'Str':
					return A3(
						_evancz$elm_graphics$Text$wrap,
						maybeHref,
						styles,
						A2(
							_elm_lang$core$String$join,
							'<br>',
							A2(
								_elm_lang$core$List$map,
								A2(_evancz$elm_graphics$Text$replace, ' ', '&nbsp;'),
								_elm_lang$core$String$lines(
									A3(
										_evancz$elm_graphics$Text$replace,
										'>',
										'&#62;',
										A3(
											_evancz$elm_graphics$Text$replace,
											'<',
											'&#60;',
											A3(
												_evancz$elm_graphics$Text$replace,
												'\'',
												'&#39;',
												A3(_evancz$elm_graphics$Text$replace, '\"', '&#34;', _p2._0))))))));
				case 'Append':
					return A3(
						_evancz$elm_graphics$Text$wrap,
						maybeHref,
						styles,
						A2(
							_elm_lang$core$Basics_ops['++'],
							_evancz$elm_graphics$Text$toHtmlString(_p2._0),
							_evancz$elm_graphics$Text$toHtmlString(_p2._1)));
				case 'Link':
					var _v2 = _elm_lang$core$Maybe$Just(
						A2(_elm_lang$core$Maybe$withDefault, _p2._0, maybeHref)),
						_v3 = styles,
						_v4 = _p2._1;
					maybeHref = _v2;
					styles = _v3;
					text = _v4;
					continue toHtmlStringHelp;
				default:
					var _v5 = maybeHref,
						_v6 = A2(
						_elm_lang$core$Basics_ops['++'],
						styles,
						A2(
							_elm_lang$core$Basics_ops['++'],
							_p2._0,
							A2(
								_elm_lang$core$Basics_ops['++'],
								':',
								A2(_elm_lang$core$Basics_ops['++'], _p2._1, ';')))),
						_v7 = _p2._2;
					maybeHref = _v5;
					styles = _v6;
					text = _v7;
					continue toHtmlStringHelp;
			}
		}
	});
var _evancz$elm_graphics$Text$colorToCss = function (color) {
	var _p3 = _elm_lang$core$Color$toRgb(color);
	var red = _p3.red;
	var green = _p3.green;
	var blue = _p3.blue;
	var alpha = _p3.alpha;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'rgba(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(red),
			A2(
				_elm_lang$core$Basics_ops['++'],
				', ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(green),
					A2(
						_elm_lang$core$Basics_ops['++'],
						', ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(blue),
							A2(
								_elm_lang$core$Basics_ops['++'],
								', ',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(alpha),
									')'))))))));
};
var _evancz$elm_graphics$Text$typefacesToString = function (faces) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'\'',
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$String$join, '\', \'', faces),
			'\''));
};
var _evancz$elm_graphics$Text$maybeAdd = F3(
	function (add, maybeValue, text) {
		var _p4 = maybeValue;
		if (_p4.ctor === 'Nothing') {
			return text;
		} else {
			return A2(add, _p4._0, text);
		}
	});
var _evancz$elm_graphics$Text$defaultStyle = {
	typeface: {ctor: '[]'},
	height: _elm_lang$core$Maybe$Nothing,
	color: _elm_lang$core$Color$black,
	bold: false,
	italic: false,
	line: _elm_lang$core$Maybe$Nothing
};
var _evancz$elm_graphics$Text$Style = F6(
	function (a, b, c, d, e, f) {
		return {typeface: a, height: b, color: c, bold: d, italic: e, line: f};
	});
var _evancz$elm_graphics$Text$Meta = F3(
	function (a, b, c) {
		return {ctor: 'Meta', _0: a, _1: b, _2: c};
	});
var _evancz$elm_graphics$Text$typeface = F2(
	function (faces, text) {
		var _p5 = faces;
		if (_p5.ctor === '[]') {
			return text;
		} else {
			return A3(
				_evancz$elm_graphics$Text$Meta,
				'font-family',
				_evancz$elm_graphics$Text$typefacesToString(faces),
				text);
		}
	});
var _evancz$elm_graphics$Text$monospace = function (text) {
	return A3(_evancz$elm_graphics$Text$Meta, 'font-family', 'monospace', text);
};
var _evancz$elm_graphics$Text$height = F2(
	function (px, text) {
		return A3(
			_evancz$elm_graphics$Text$Meta,
			'font-size',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(px),
				'px'),
			text);
	});
var _evancz$elm_graphics$Text$color = F2(
	function (color, text) {
		return A3(
			_evancz$elm_graphics$Text$Meta,
			'color',
			_evancz$elm_graphics$Text$colorToCss(color),
			text);
	});
var _evancz$elm_graphics$Text$bold = function (text) {
	return A3(_evancz$elm_graphics$Text$Meta, 'font-weight', 'bold', text);
};
var _evancz$elm_graphics$Text$italic = function (text) {
	return A3(_evancz$elm_graphics$Text$Meta, 'font-style', 'italic', text);
};
var _evancz$elm_graphics$Text$line = F2(
	function (lineTag, text) {
		var decoration = function () {
			var _p6 = lineTag;
			switch (_p6.ctor) {
				case 'Under':
					return 'underline';
				case 'Over':
					return 'overline';
				default:
					return 'line-through';
			}
		}();
		return A3(_evancz$elm_graphics$Text$Meta, 'text-decoration', decoration, text);
	});
var _evancz$elm_graphics$Text$style = F2(
	function (sty, text) {
		return A3(
			_evancz$elm_graphics$Text$maybeAdd,
			_evancz$elm_graphics$Text$height,
			sty.height,
			A3(
				_evancz$elm_graphics$Text$maybeAdd,
				_evancz$elm_graphics$Text$line,
				sty.line,
				(sty.italic ? _evancz$elm_graphics$Text$italic : _elm_lang$core$Basics$identity)(
					(sty.bold ? _evancz$elm_graphics$Text$bold : _elm_lang$core$Basics$identity)(
						A2(
							_evancz$elm_graphics$Text$typeface,
							sty.typeface,
							A2(_evancz$elm_graphics$Text$color, sty.color, text))))));
	});
var _evancz$elm_graphics$Text$Link = F2(
	function (a, b) {
		return {ctor: 'Link', _0: a, _1: b};
	});
var _evancz$elm_graphics$Text$link = _evancz$elm_graphics$Text$Link;
var _evancz$elm_graphics$Text$Append = F2(
	function (a, b) {
		return {ctor: 'Append', _0: a, _1: b};
	});
var _evancz$elm_graphics$Text$append = _evancz$elm_graphics$Text$Append;
var _evancz$elm_graphics$Text$Str = function (a) {
	return {ctor: 'Str', _0: a};
};
var _evancz$elm_graphics$Text$fromString = _evancz$elm_graphics$Text$Str;
var _evancz$elm_graphics$Text$empty = _evancz$elm_graphics$Text$fromString('');
var _evancz$elm_graphics$Text$concat = function (texts) {
	return A3(_elm_lang$core$List$foldr, _evancz$elm_graphics$Text$append, _evancz$elm_graphics$Text$empty, texts);
};
var _evancz$elm_graphics$Text$join = F2(
	function (seperator, texts) {
		return _evancz$elm_graphics$Text$concat(
			A2(_elm_lang$core$List$intersperse, seperator, texts));
	});
var _evancz$elm_graphics$Text$Through = {ctor: 'Through'};
var _evancz$elm_graphics$Text$Over = {ctor: 'Over'};
var _evancz$elm_graphics$Text$Under = {ctor: 'Under'};

var _evancz$elm_graphics$Element$justified = _evancz$elm_graphics$Native_Element.block('justify');
var _evancz$elm_graphics$Element$centered = _evancz$elm_graphics$Native_Element.block('center');
var _evancz$elm_graphics$Element$rightAligned = _evancz$elm_graphics$Native_Element.block('right');
var _evancz$elm_graphics$Element$leftAligned = _evancz$elm_graphics$Native_Element.block('left');
var _evancz$elm_graphics$Element$show = function (value) {
	return _evancz$elm_graphics$Element$leftAligned(
		_evancz$elm_graphics$Text$monospace(
			_evancz$elm_graphics$Text$fromString(
				_elm_lang$core$Basics$toString(value))));
};
var _evancz$elm_graphics$Element$newElement = _evancz$elm_graphics$Native_Element.newElement;
var _evancz$elm_graphics$Element$sizeOf = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1._0;
	return {ctor: '_Tuple2', _0: _p2.props.width, _1: _p2.props.height};
};
var _evancz$elm_graphics$Element$heightOf = function (_p3) {
	var _p4 = _p3;
	return _p4._0.props.height;
};
var _evancz$elm_graphics$Element$widthOf = function (_p5) {
	var _p6 = _p5;
	return _p6._0.props.width;
};
var _evancz$elm_graphics$Element$toHtml = _evancz$elm_graphics$Native_Element.toHtml;
var _evancz$elm_graphics$Element$Properties = F6(
	function (a, b, c, d, e, f) {
		return {width: a, height: b, opacity: c, color: d, href: e, tag: f};
	});
var _evancz$elm_graphics$Element$RawPosition = F4(
	function (a, b, c, d) {
		return {horizontal: a, vertical: b, x: c, y: d};
	});
var _evancz$elm_graphics$Element$Element_elm_builtin = function (a) {
	return {ctor: 'Element_elm_builtin', _0: a};
};
var _evancz$elm_graphics$Element$width = F2(
	function (newWidth, _p7) {
		var _p8 = _p7;
		var _p11 = _p8._0.props;
		var _p10 = _p8._0.element;
		var newHeight = function () {
			var _p9 = _p10;
			switch (_p9.ctor) {
				case 'Image':
					return _elm_lang$core$Basics$round(
						(_elm_lang$core$Basics$toFloat(_p9._2) / _elm_lang$core$Basics$toFloat(_p9._1)) * _elm_lang$core$Basics$toFloat(newWidth));
				case 'RawHtml':
					return _elm_lang$core$Tuple$second(
						A2(_evancz$elm_graphics$Native_Element.htmlHeight, newWidth, _p10));
				default:
					return _p11.height;
			}
		}();
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p10,
				props: _elm_lang$core$Native_Utils.update(
					_p11,
					{width: newWidth, height: newHeight})
			});
	});
var _evancz$elm_graphics$Element$height = F2(
	function (newHeight, _p12) {
		var _p13 = _p12;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p13._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p13._0.props,
					{height: newHeight})
			});
	});
var _evancz$elm_graphics$Element$size = F3(
	function (w, h, e) {
		return A2(
			_evancz$elm_graphics$Element$height,
			h,
			A2(_evancz$elm_graphics$Element$width, w, e));
	});
var _evancz$elm_graphics$Element$opacity = F2(
	function (givenOpacity, _p14) {
		var _p15 = _p14;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p15._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p15._0.props,
					{opacity: givenOpacity})
			});
	});
var _evancz$elm_graphics$Element$color = F2(
	function (clr, _p16) {
		var _p17 = _p16;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p17._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p17._0.props,
					{
						color: _elm_lang$core$Maybe$Just(clr)
					})
			});
	});
var _evancz$elm_graphics$Element$tag = F2(
	function (name, _p18) {
		var _p19 = _p18;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p19._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p19._0.props,
					{tag: name})
			});
	});
var _evancz$elm_graphics$Element$link = F2(
	function (href, _p20) {
		var _p21 = _p20;
		return _evancz$elm_graphics$Element$Element_elm_builtin(
			{
				element: _p21._0.element,
				props: _elm_lang$core$Native_Utils.update(
					_p21._0.props,
					{href: href})
			});
	});
var _evancz$elm_graphics$Element$Custom = {ctor: 'Custom'};
var _evancz$elm_graphics$Element$RawHtml = {ctor: 'RawHtml'};
var _evancz$elm_graphics$Element$Spacer = {ctor: 'Spacer'};
var _evancz$elm_graphics$Element$spacer = F2(
	function (w, h) {
		return A3(_evancz$elm_graphics$Element$newElement, w, h, _evancz$elm_graphics$Element$Spacer);
	});
var _evancz$elm_graphics$Element$empty = A2(_evancz$elm_graphics$Element$spacer, 0, 0);
var _evancz$elm_graphics$Element$Flow = F2(
	function (a, b) {
		return {ctor: 'Flow', _0: a, _1: b};
	});
var _evancz$elm_graphics$Element$flow = F2(
	function (dir, es) {
		var newFlow = F2(
			function (w, h) {
				return A3(
					_evancz$elm_graphics$Element$newElement,
					w,
					h,
					A2(_evancz$elm_graphics$Element$Flow, dir, es));
			});
		var maxOrZero = function (list) {
			return A2(
				_elm_lang$core$Maybe$withDefault,
				0,
				_elm_lang$core$List$maximum(list));
		};
		var hs = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$heightOf, es);
		var ws = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$widthOf, es);
		if (_elm_lang$core$Native_Utils.eq(
			es,
			{ctor: '[]'})) {
			return _evancz$elm_graphics$Element$empty;
		} else {
			var _p22 = dir;
			switch (_p22.ctor) {
				case 'DUp':
					return A2(
						newFlow,
						maxOrZero(ws),
						_elm_lang$core$List$sum(hs));
				case 'DDown':
					return A2(
						newFlow,
						maxOrZero(ws),
						_elm_lang$core$List$sum(hs));
				case 'DLeft':
					return A2(
						newFlow,
						_elm_lang$core$List$sum(ws),
						maxOrZero(hs));
				case 'DRight':
					return A2(
						newFlow,
						_elm_lang$core$List$sum(ws),
						maxOrZero(hs));
				case 'DIn':
					return A2(
						newFlow,
						maxOrZero(ws),
						maxOrZero(hs));
				default:
					return A2(
						newFlow,
						maxOrZero(ws),
						maxOrZero(hs));
			}
		}
	});
var _evancz$elm_graphics$Element$Container = F2(
	function (a, b) {
		return {ctor: 'Container', _0: a, _1: b};
	});
var _evancz$elm_graphics$Element$container = F4(
	function (w, h, _p23, e) {
		var _p24 = _p23;
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A2(_evancz$elm_graphics$Element$Container, _p24._0, e));
	});
var _evancz$elm_graphics$Element$Image = F4(
	function (a, b, c, d) {
		return {ctor: 'Image', _0: a, _1: b, _2: c, _3: d};
	});
var _evancz$elm_graphics$Element$Tiled = {ctor: 'Tiled'};
var _evancz$elm_graphics$Element$tiledImage = F3(
	function (w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(_evancz$elm_graphics$Element$Image, _evancz$elm_graphics$Element$Tiled, w, h, src));
	});
var _evancz$elm_graphics$Element$Cropped = function (a) {
	return {ctor: 'Cropped', _0: a};
};
var _evancz$elm_graphics$Element$croppedImage = F4(
	function (pos, w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(
				_evancz$elm_graphics$Element$Image,
				_evancz$elm_graphics$Element$Cropped(pos),
				w,
				h,
				src));
	});
var _evancz$elm_graphics$Element$Fitted = {ctor: 'Fitted'};
var _evancz$elm_graphics$Element$fittedImage = F3(
	function (w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(_evancz$elm_graphics$Element$Image, _evancz$elm_graphics$Element$Fitted, w, h, src));
	});
var _evancz$elm_graphics$Element$Plain = {ctor: 'Plain'};
var _evancz$elm_graphics$Element$image = F3(
	function (w, h, src) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			w,
			h,
			A4(_evancz$elm_graphics$Element$Image, _evancz$elm_graphics$Element$Plain, w, h, src));
	});
var _evancz$elm_graphics$Element$N = {ctor: 'N'};
var _evancz$elm_graphics$Element$Z = {ctor: 'Z'};
var _evancz$elm_graphics$Element$P = {ctor: 'P'};
var _evancz$elm_graphics$Element$Relative = function (a) {
	return {ctor: 'Relative', _0: a};
};
var _evancz$elm_graphics$Element$relative = _evancz$elm_graphics$Element$Relative;
var _evancz$elm_graphics$Element$Absolute = function (a) {
	return {ctor: 'Absolute', _0: a};
};
var _evancz$elm_graphics$Element$absolute = _evancz$elm_graphics$Element$Absolute;
var _evancz$elm_graphics$Element$Position = function (a) {
	return {ctor: 'Position', _0: a};
};
var _evancz$elm_graphics$Element$middle = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$Z,
		vertical: _evancz$elm_graphics$Element$Z,
		x: _evancz$elm_graphics$Element$Relative(0.5),
		y: _evancz$elm_graphics$Element$Relative(0.5)
	});
var _evancz$elm_graphics$Element$topLeft = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$N,
		vertical: _evancz$elm_graphics$Element$P,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$topRight = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$P,
		vertical: _evancz$elm_graphics$Element$P,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$bottomLeft = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$N,
		vertical: _evancz$elm_graphics$Element$N,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$bottomRight = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$P,
		vertical: _evancz$elm_graphics$Element$N,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$midLeft = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$N,
		vertical: _evancz$elm_graphics$Element$Z,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Relative(0.5)
	});
var _evancz$elm_graphics$Element$midRight = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$P,
		vertical: _evancz$elm_graphics$Element$Z,
		x: _evancz$elm_graphics$Element$Absolute(0),
		y: _evancz$elm_graphics$Element$Relative(0.5)
	});
var _evancz$elm_graphics$Element$midTop = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$Z,
		vertical: _evancz$elm_graphics$Element$P,
		x: _evancz$elm_graphics$Element$Relative(0.5),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$midBottom = _evancz$elm_graphics$Element$Position(
	{
		horizontal: _evancz$elm_graphics$Element$Z,
		vertical: _evancz$elm_graphics$Element$N,
		x: _evancz$elm_graphics$Element$Relative(0.5),
		y: _evancz$elm_graphics$Element$Absolute(0)
	});
var _evancz$elm_graphics$Element$middleAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$Z, vertical: _evancz$elm_graphics$Element$Z, x: x, y: y});
	});
var _evancz$elm_graphics$Element$topLeftAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$N, vertical: _evancz$elm_graphics$Element$P, x: x, y: y});
	});
var _evancz$elm_graphics$Element$topRightAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$P, vertical: _evancz$elm_graphics$Element$P, x: x, y: y});
	});
var _evancz$elm_graphics$Element$bottomLeftAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$N, vertical: _evancz$elm_graphics$Element$N, x: x, y: y});
	});
var _evancz$elm_graphics$Element$bottomRightAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$P, vertical: _evancz$elm_graphics$Element$N, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midLeftAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$N, vertical: _evancz$elm_graphics$Element$Z, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midRightAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$P, vertical: _evancz$elm_graphics$Element$Z, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midTopAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$Z, vertical: _evancz$elm_graphics$Element$P, x: x, y: y});
	});
var _evancz$elm_graphics$Element$midBottomAt = F2(
	function (x, y) {
		return _evancz$elm_graphics$Element$Position(
			{horizontal: _evancz$elm_graphics$Element$Z, vertical: _evancz$elm_graphics$Element$N, x: x, y: y});
	});
var _evancz$elm_graphics$Element$DOut = {ctor: 'DOut'};
var _evancz$elm_graphics$Element$layers = function (es) {
	var hs = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$heightOf, es);
	var ws = A2(_elm_lang$core$List$map, _evancz$elm_graphics$Element$widthOf, es);
	return A3(
		_evancz$elm_graphics$Element$newElement,
		A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$maximum(ws)),
		A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			_elm_lang$core$List$maximum(hs)),
		A2(_evancz$elm_graphics$Element$Flow, _evancz$elm_graphics$Element$DOut, es));
};
var _evancz$elm_graphics$Element$outward = _evancz$elm_graphics$Element$DOut;
var _evancz$elm_graphics$Element$DIn = {ctor: 'DIn'};
var _evancz$elm_graphics$Element$inward = _evancz$elm_graphics$Element$DIn;
var _evancz$elm_graphics$Element$DRight = {ctor: 'DRight'};
var _evancz$elm_graphics$Element$right = _evancz$elm_graphics$Element$DRight;
var _evancz$elm_graphics$Element$beside = F2(
	function (lft, rht) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			_evancz$elm_graphics$Element$widthOf(lft) + _evancz$elm_graphics$Element$widthOf(rht),
			A2(
				_elm_lang$core$Basics$max,
				_evancz$elm_graphics$Element$heightOf(lft),
				_evancz$elm_graphics$Element$heightOf(rht)),
			A2(
				_evancz$elm_graphics$Element$Flow,
				_evancz$elm_graphics$Element$right,
				{
					ctor: '::',
					_0: lft,
					_1: {
						ctor: '::',
						_0: rht,
						_1: {ctor: '[]'}
					}
				}));
	});
var _evancz$elm_graphics$Element$DLeft = {ctor: 'DLeft'};
var _evancz$elm_graphics$Element$left = _evancz$elm_graphics$Element$DLeft;
var _evancz$elm_graphics$Element$DDown = {ctor: 'DDown'};
var _evancz$elm_graphics$Element$above = F2(
	function (hi, lo) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			A2(
				_elm_lang$core$Basics$max,
				_evancz$elm_graphics$Element$widthOf(hi),
				_evancz$elm_graphics$Element$widthOf(lo)),
			_evancz$elm_graphics$Element$heightOf(hi) + _evancz$elm_graphics$Element$heightOf(lo),
			A2(
				_evancz$elm_graphics$Element$Flow,
				_evancz$elm_graphics$Element$DDown,
				{
					ctor: '::',
					_0: hi,
					_1: {
						ctor: '::',
						_0: lo,
						_1: {ctor: '[]'}
					}
				}));
	});
var _evancz$elm_graphics$Element$below = F2(
	function (lo, hi) {
		return A3(
			_evancz$elm_graphics$Element$newElement,
			A2(
				_elm_lang$core$Basics$max,
				_evancz$elm_graphics$Element$widthOf(hi),
				_evancz$elm_graphics$Element$widthOf(lo)),
			_evancz$elm_graphics$Element$heightOf(hi) + _evancz$elm_graphics$Element$heightOf(lo),
			A2(
				_evancz$elm_graphics$Element$Flow,
				_evancz$elm_graphics$Element$DDown,
				{
					ctor: '::',
					_0: hi,
					_1: {
						ctor: '::',
						_0: lo,
						_1: {ctor: '[]'}
					}
				}));
	});
var _evancz$elm_graphics$Element$down = _evancz$elm_graphics$Element$DDown;
var _evancz$elm_graphics$Element$DUp = {ctor: 'DUp'};
var _evancz$elm_graphics$Element$up = _evancz$elm_graphics$Element$DUp;

var _evancz$elm_graphics$Native_Collage = function()
{

function setStrokeStyle(ctx, style)
{
	ctx.lineWidth = style.width;

	var cap = style.cap.ctor;
	ctx.lineCap = cap === 'Flat'
		? 'butt'
		: cap === 'Round'
			? 'round'
			: 'square';

	var join = style.join.ctor;
	ctx.lineJoin = join === 'Smooth'
		? 'round'
		: join === 'Sharp'
			? 'miter'
			: 'bevel';

	ctx.miterLimit = style.join._0 || 10;
	ctx.strokeStyle = _evancz$elm_graphics$Text$colorToCss(style.color);
}

function setFillStyle(redo, ctx, style)
{
	var sty = style.ctor;
	ctx.fillStyle = sty === 'Solid'
		? _evancz$elm_graphics$Text$colorToCss(style._0)
		: sty === 'Texture'
			? texture(redo, ctx, style._0)
			: gradient(ctx, style._0);
}

function trace(ctx, path)
{
	var points = _elm_lang$core$Native_List.toArray(path);
	var i = points.length - 1;
	if (i <= 0)
	{
		return;
	}
	ctx.moveTo(points[i]._0, points[i]._1);
	while (i--)
	{
		ctx.lineTo(points[i]._0, points[i]._1);
	}
	if (path.closed)
	{
		i = points.length - 1;
		ctx.lineTo(points[i]._0, points[i]._1);
	}
}

function line(ctx, style, path)
{
	if (style.dashing.ctor === '[]')
	{
		trace(ctx, path);
	}
	else
	{
		customLineHelp(ctx, style, path);
	}
	ctx.scale(1, -1);
	ctx.stroke();
}

function customLineHelp(ctx, style, path)
{
	var points = _elm_lang$core$Native_List.toArray(path);
	if (path.closed)
	{
		points.push(points[0]);
	}
	var pattern = _elm_lang$core$Native_List.toArray(style.dashing);
	var i = points.length - 1;
	if (i <= 0)
	{
		return;
	}
	var x0 = points[i]._0, y0 = points[i]._1;
	var x1 = 0, y1 = 0, dx = 0, dy = 0, remaining = 0;
	var pindex = 0, plen = pattern.length;
	var draw = true, segmentLength = pattern[0];
	ctx.moveTo(x0, y0);
	while (i--)
	{
		x1 = points[i]._0;
		y1 = points[i]._1;
		dx = x1 - x0;
		dy = y1 - y0;
		remaining = Math.sqrt(dx * dx + dy * dy);
		while (segmentLength <= remaining)
		{
			x0 += dx * segmentLength / remaining;
			y0 += dy * segmentLength / remaining;
			ctx[draw ? 'lineTo' : 'moveTo'](x0, y0);
			// update starting position
			dx = x1 - x0;
			dy = y1 - y0;
			remaining = Math.sqrt(dx * dx + dy * dy);
			// update pattern
			draw = !draw;
			pindex = (pindex + 1) % plen;
			segmentLength = pattern[pindex];
		}
		if (remaining > 0)
		{
			ctx[draw ? 'lineTo' : 'moveTo'](x1, y1);
			segmentLength -= remaining;
		}
		x0 = x1;
		y0 = y1;
	}
}

function drawLine(ctx, style, path)
{
	setStrokeStyle(ctx, style);
	return line(ctx, style, path);
}

function texture(redo, ctx, src)
{
	var img = new Image();
	img.src = src;
	img.onload = redo;
	return ctx.createPattern(img, 'repeat');
}

function gradient(ctx, grad)
{
	var g;
	var stops = [];
	if (grad.ctor === 'Linear')
	{
		var p0 = grad._0, p1 = grad._1;
		g = ctx.createLinearGradient(p0._0, -p0._1, p1._0, -p1._1);
		stops = _elm_lang$core$Native_List.toArray(grad._2);
	}
	else
	{
		var p0 = grad._0, p2 = grad._2;
		g = ctx.createRadialGradient(p0._0, -p0._1, grad._1, p2._0, -p2._1, grad._3);
		stops = _elm_lang$core$Native_List.toArray(grad._4);
	}
	var len = stops.length;
	for (var i = 0; i < len; ++i)
	{
		var stop = stops[i];
		g.addColorStop(stop._0, _evancz$elm_graphics$Text$colorToCss(stop._1));
	}
	return g;
}

function drawShape(redo, ctx, style, path)
{
	trace(ctx, path);
	setFillStyle(redo, ctx, style);
	ctx.scale(1, -1);
	ctx.fill();
}


// TEXT RENDERING

function fillText(redo, ctx, text)
{
	drawText(ctx, text, ctx.fillText);
}

function strokeText(redo, ctx, style, text)
{
	setStrokeStyle(ctx, style);
	// Use native canvas API for dashes only for text for now
	// Degrades to non-dashed on IE 9 + 10
	if (style.dashing.ctor !== '[]' && ctx.setLineDash)
	{
		var pattern = _elm_lang$core$Native_List.toArray(style.dashing);
		ctx.setLineDash(pattern);
	}
	drawText(ctx, text, ctx.strokeText);
}

function drawText(ctx, text, canvasDrawFn)
{
	var textChunks = chunkText(copy(defaultFacts), text);

	var totalWidth = 0;
	var maxHeight = 0;
	var numChunks = textChunks.length;

	ctx.scale(1,-1);

	for (var i = numChunks; i--; )
	{
		var chunk = textChunks[i];
		ctx.font = chunk.font;
		var metrics = ctx.measureText(chunk.text);
		chunk.width = metrics.width;
		totalWidth += chunk.width;
		if (chunk.height > maxHeight)
		{
			maxHeight = chunk.height;
		}
	}

	var x = -totalWidth / 2.0;
	for (var i = 0; i < numChunks; ++i)
	{
		var chunk = textChunks[i];
		ctx.font = chunk.font;
		ctx.fillStyle = chunk.color;
		canvasDrawFn.call(ctx, chunk.text, x, maxHeight / 2);
		x += chunk.width;
	}
}

function toFont(facts)
{
	return facts['font-style']
		+ ' ' + facts['font-variant']
		+ ' ' + facts['font-weight']
		+ ' ' + facts['font-size']
		+ ' ' + facts['font-family'];
}


// Convert the object returned by the text module
// into something we can use for styling canvas text
function chunkText(facts, text)
{
	switch (text.ctor)
	{
		case 'Append':
			var leftChunks = chunkText(copy(facts), text._0);
			var rightChunks = chunkText(copy(facts), text._1);
			return leftChunks.concat(rightChunks);

		case 'Str':
			return [{
				text: text._0,
				color: facts['color'],
				height: facts['font-size'].slice(0, -2) | 0,
				font: toFont(facts)
			}];

		case 'Link':
			return chunkText(facts, text._1);

		case 'Meta':
			facts[text._0] = text._1;
			return chunkText(facts, text._2);
	}
}

function copy(facts)
{
	return {
		'font-style': facts['font-style'],
		'font-variant': facts['font-variant'],
		'font-weight': facts['font-weight'],
		'font-size': facts['font-size'],
		'font-family': facts['font-family'],
		'color': facts['color']
	};
}

var defaultFacts = {
	'font-style': 'normal',
	'font-variant': 'normal',
	'font-weight': 'normal',
	'font-size': '12px',
	'font-family': 'sans-serif',
	'color': 'black'
};


// IMAGES

function drawImage(redo, ctx, form)
{
	var img = new Image();
	img.onload = redo;
	img.src = form._3;
	var w = form._0,
		h = form._1,
		pos = form._2,
		srcX = pos._0,
		srcY = pos._1,
		srcW = w,
		srcH = h,
		destX = -w / 2,
		destY = -h / 2,
		destW = w,
		destH = h;

	ctx.scale(1, -1);
	ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
}

function renderForm(redo, ctx, form)
{
	ctx.save();

	var x = form.x,
		y = form.y,
		theta = form.theta,
		scale = form.scale;

	if (x !== 0 || y !== 0)
	{
		ctx.translate(x, y);
	}
	if (theta !== 0)
	{
		ctx.rotate(theta % (Math.PI * 2));
	}
	if (scale !== 1)
	{
		ctx.scale(scale, scale);
	}
	if (form.alpha !== 1)
	{
		ctx.globalAlpha = ctx.globalAlpha * form.alpha;
	}

	ctx.beginPath();
	var f = form.form;
	switch (f.ctor)
	{
		case 'FPath':
			drawLine(ctx, f._0, f._1);
			break;

		case 'FImage':
			drawImage(redo, ctx, f);
			break;

		case 'FShape':
			if (f._0.ctor === 'Line')
			{
				f._1.closed = true;
				drawLine(ctx, f._0._0, f._1);
			}
			else
			{
				drawShape(redo, ctx, f._0._0, f._1);
			}
			break;

		case 'FText':
			fillText(redo, ctx, f._0);
			break;

		case 'FOutlinedText':
			strokeText(redo, ctx, f._0, f._1);
			break;
	}
	ctx.restore();
}

function formToMatrix(form)
{
	var scale = form.scale;
	var matrix = A6( _evancz$elm_graphics$Transform$matrix, scale, 0, 0, scale, form.x, form.y );

	var theta = form.theta;
	if (theta !== 0)
	{
		matrix = A2(
			_evancz$elm_graphics$Transform$multiply,
			matrix,
			_evancz$elm_graphics$Transform$rotation(theta)
		);
	}

   return matrix;
}

function str(n)
{
	if (n < 0.00001 && n > -0.00001)
	{
		return 0;
	}
	return n;
}

function makeTransform(w, h, form, matrices)
{
	var props = form.form._0._0.props;
	var m = A6(
		_evancz$elm_graphics$Transform$matrix,
		1,
		0,
		0,
		-1,
		(w - props.width ) / 2,
		(h - props.height) / 2
	);

	var len = matrices.length;
	for (var i = 0; i < len; ++i)
	{
		m = A2( _evancz$elm_graphics$Transform$multiply, m, matrices[i] );
	}
	m = A2( _evancz$elm_graphics$Transform$multiply, m, formToMatrix(form) );

	return 'matrix(' +
		str( m[0]) + ', ' + str( m[3]) + ', ' +
		str(-m[1]) + ', ' + str(-m[4]) + ', ' +
		str( m[2]) + ', ' + str( m[5]) + ')';
}

function stepperHelp(list)
{
	var arr = _elm_lang$core$Native_List.toArray(list);
	var i = 0;
	function peekNext()
	{
		return i < arr.length ? arr[i]._0.form.ctor : '';
	}
	// assumes that there is a next element
	function next()
	{
		var out = arr[i]._0;
		++i;
		return out;
	}
	return {
		peekNext: peekNext,
		next: next
	};
}

function formStepper(forms)
{
	var ps = [stepperHelp(forms)];
	var matrices = [];
	var alphas = [];
	function peekNext()
	{
		var len = ps.length;
		var formType = '';
		for (var i = 0; i < len; ++i )
		{
			if (formType = ps[i].peekNext()) return formType;
		}
		return '';
	}
	// assumes that there is a next element
	function next(ctx)
	{
		while (!ps[0].peekNext())
		{
			ps.shift();
			matrices.pop();
			alphas.shift();
			if (ctx)
			{
				ctx.restore();
			}
		}
		var out = ps[0].next();
		var f = out.form;
		if (f.ctor === 'FGroup')
		{
			ps.unshift(stepperHelp(f._1));
			var m = A2(_evancz$elm_graphics$Transform$multiply, f._0, formToMatrix(out));
			ctx.save();
			ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
			matrices.push(m);

			var alpha = (alphas[0] || 1) * out.alpha;
			alphas.unshift(alpha);
			ctx.globalAlpha = alpha;
		}
		return out;
	}
	function transforms()
	{
		return matrices;
	}
	function alpha()
	{
		return alphas[0] || 1;
	}
	return {
		peekNext: peekNext,
		next: next,
		transforms: transforms,
		alpha: alpha
	};
}

function makeCanvas(w, h)
{
	var canvas = _evancz$elm_graphics$Native_Element.createNode('canvas');
	canvas.style.width  = w + 'px';
	canvas.style.height = h + 'px';
	canvas.style.display = 'block';
	canvas.style.position = 'absolute';
	var ratio = window.devicePixelRatio || 1;
	canvas.width  = w * ratio;
	canvas.height = h * ratio;
	return canvas;
}

function render(model)
{
	var div = _evancz$elm_graphics$Native_Element.createNode('div');
	div.style.overflow = 'hidden';
	div.style.position = 'relative';
	update(div, model, model);
	return div;
}

function nodeStepper(w, h, div)
{
	var kids = div.childNodes;
	var i = 0;
	var ratio = window.devicePixelRatio || 1;

	function transform(transforms, ctx)
	{
		ctx.translate( w / 2 * ratio, h / 2 * ratio );
		ctx.scale( ratio, -ratio );
		var len = transforms.length;
		for (var i = 0; i < len; ++i)
		{
			var m = transforms[i];
			ctx.save();
			ctx.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
		}
		return ctx;
	}
	function nextContext(transforms)
	{
		while (i < kids.length)
		{
			var node = kids[i];
			if (node.getContext)
			{
				node.width = w * ratio;
				node.height = h * ratio;
				node.style.width = w + 'px';
				node.style.height = h + 'px';
				++i;
				return transform(transforms, node.getContext('2d'));
			}
			div.removeChild(node);
		}
		var canvas = makeCanvas(w, h);
		div.appendChild(canvas);
		// we have added a new node, so we must step our position
		++i;
		return transform(transforms, canvas.getContext('2d'));
	}
	function addElement(matrices, alpha, form)
	{
		var kid = kids[i];
		var elem = form.form._0;

		var node = (!kid || kid.getContext)
			? _evancz$elm_graphics$Native_Element.render(elem)
			: _evancz$elm_graphics$Native_Element.update(kid, kid.oldElement, elem);

		node.style.position = 'absolute';
		node.style.opacity = alpha * form.alpha * elem._0.props.opacity;
		_evancz$elm_graphics$Native_Element.addTransform(node.style, makeTransform(w, h, form, matrices));
		node.oldElement = elem;
		++i;
		if (!kid)
		{
			div.appendChild(node);
		}
		else
		{
			div.insertBefore(node, kid);
		}
	}
	function clearRest()
	{
		while (i < kids.length)
		{
			div.removeChild(kids[i]);
		}
	}
	return {
		nextContext: nextContext,
		addElement: addElement,
		clearRest: clearRest
	};
}


function update(div, _, model)
{
	var w = model.w;
	var h = model.h;

	var forms = formStepper(model.forms);
	var nodes = nodeStepper(w, h, div);
	var ctx = null;
	var formType = '';

	while (formType = forms.peekNext())
	{
		// make sure we have context if we need it
		if (ctx === null && formType !== 'FElement')
		{
			ctx = nodes.nextContext(forms.transforms());
			ctx.globalAlpha = forms.alpha();
		}

		var form = forms.next(ctx);
		// if it is FGroup, all updates are made within formStepper when next is called.
		if (formType === 'FElement')
		{
			// update or insert an element, get a new context
			nodes.addElement(forms.transforms(), forms.alpha(), form);
			ctx = null;
		}
		else if (formType !== 'FGroup')
		{
			renderForm(function() { update(div, model, model); }, ctx, form);
		}
	}
	nodes.clearRest();
	return div;
}


function collage(w, h, forms)
{
	return A3(_evancz$elm_graphics$Native_Element.newElement, w, h, {
		ctor: 'Custom',
		type: 'Collage',
		render: render,
		update: update,
		model: {w: w, h: h, forms: forms}
	});
}

return {
	collage: F3(collage)
};

}();

var _evancz$elm_graphics$Native_Transform = function()
{

var A;
if (typeof Float32Array === 'undefined')
{
	A = function(arr)
	{
		this.length = arr.length;
		this[0] = arr[0];
		this[1] = arr[1];
		this[2] = arr[2];
		this[3] = arr[3];
		this[4] = arr[4];
		this[5] = arr[5];
	};
}
else
{
	A = Float32Array;
}

// layout of matrix in an array is
//
//   | m11 m12 dx |
//   | m21 m22 dy |
//   |  0   0   1 |
//
//  new A([ m11, m12, dx, m21, m22, dy ])

var identity = new A([1, 0, 0, 0, 1, 0]);

function matrix(m11, m12, m21, m22, dx, dy)
{
	return new A([m11, m12, dx, m21, m22, dy]);
}

function rotation(t)
{
	var c = Math.cos(t);
	var s = Math.sin(t);
	return new A([c, -s, 0, s, c, 0]);
}

function rotate(t, m)
{
	var c = Math.cos(t);
	var s = Math.sin(t);
	var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4];
	return new A([
		m11 * c + m12 * s,
		-m11 * s + m12 * c,
		m[2],
		m21 * c + m22 * s,
		-m21 * s + m22 * c,
		m[5]
	]);
}

function multiply(m, n)
{
	var m11 = m[0], m12 = m[1], m21 = m[3], m22 = m[4], mdx = m[2], mdy = m[5];
	var n11 = n[0], n12 = n[1], n21 = n[3], n22 = n[4], ndx = n[2], ndy = n[5];
	return new A([
		m11 * n11 + m12 * n21,
		m11 * n12 + m12 * n22,
		m11 * ndx + m12 * ndy + mdx,
		m21 * n11 + m22 * n21,
		m21 * n12 + m22 * n22,
		m21 * ndx + m22 * ndy + mdy
	]);
}

return {
	identity: identity,
	matrix: F6(matrix),
	rotation: rotation,
	multiply: F2(multiply)
};

}();

var _evancz$elm_graphics$Transform$multiply = _evancz$elm_graphics$Native_Transform.multiply;
var _evancz$elm_graphics$Transform$rotation = _evancz$elm_graphics$Native_Transform.rotation;
var _evancz$elm_graphics$Transform$matrix = _evancz$elm_graphics$Native_Transform.matrix;
var _evancz$elm_graphics$Transform$translation = F2(
	function (x, y) {
		return A6(_evancz$elm_graphics$Transform$matrix, 1, 0, 0, 1, x, y);
	});
var _evancz$elm_graphics$Transform$scale = function (s) {
	return A6(_evancz$elm_graphics$Transform$matrix, s, 0, 0, s, 0, 0);
};
var _evancz$elm_graphics$Transform$scaleX = function (x) {
	return A6(_evancz$elm_graphics$Transform$matrix, x, 0, 0, 1, 0, 0);
};
var _evancz$elm_graphics$Transform$scaleY = function (y) {
	return A6(_evancz$elm_graphics$Transform$matrix, 1, 0, 0, y, 0, 0);
};
var _evancz$elm_graphics$Transform$identity = _evancz$elm_graphics$Native_Transform.identity;
var _evancz$elm_graphics$Transform$Transform = {ctor: 'Transform'};

var _evancz$elm_graphics$Collage$collage = _evancz$elm_graphics$Native_Collage.collage;
var _evancz$elm_graphics$Collage$LineStyle = F6(
	function (a, b, c, d, e, f) {
		return {color: a, width: b, cap: c, join: d, dashing: e, dashOffset: f};
	});
var _evancz$elm_graphics$Collage$Form_elm_builtin = function (a) {
	return {ctor: 'Form_elm_builtin', _0: a};
};
var _evancz$elm_graphics$Collage$form = function (f) {
	return _evancz$elm_graphics$Collage$Form_elm_builtin(
		{theta: 0, scale: 1, x: 0, y: 0, alpha: 1, form: f});
};
var _evancz$elm_graphics$Collage$move = F2(
	function (_p1, _p0) {
		var _p2 = _p1;
		var _p3 = _p0;
		var _p4 = _p3._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p4,
				{x: _p4.x + _p2._0, y: _p4.y + _p2._1}));
	});
var _evancz$elm_graphics$Collage$moveX = F2(
	function (x, _p5) {
		var _p6 = _p5;
		var _p7 = _p6._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p7,
				{x: _p7.x + x}));
	});
var _evancz$elm_graphics$Collage$moveY = F2(
	function (y, _p8) {
		var _p9 = _p8;
		var _p10 = _p9._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p10,
				{y: _p10.y + y}));
	});
var _evancz$elm_graphics$Collage$scale = F2(
	function (s, _p11) {
		var _p12 = _p11;
		var _p13 = _p12._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p13,
				{scale: _p13.scale * s}));
	});
var _evancz$elm_graphics$Collage$rotate = F2(
	function (t, _p14) {
		var _p15 = _p14;
		var _p16 = _p15._0;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p16,
				{theta: _p16.theta + t}));
	});
var _evancz$elm_graphics$Collage$alpha = F2(
	function (a, _p17) {
		var _p18 = _p17;
		return _evancz$elm_graphics$Collage$Form_elm_builtin(
			_elm_lang$core$Native_Utils.update(
				_p18._0,
				{alpha: a}));
	});
var _evancz$elm_graphics$Collage$Grad = function (a) {
	return {ctor: 'Grad', _0: a};
};
var _evancz$elm_graphics$Collage$Texture = function (a) {
	return {ctor: 'Texture', _0: a};
};
var _evancz$elm_graphics$Collage$Solid = function (a) {
	return {ctor: 'Solid', _0: a};
};
var _evancz$elm_graphics$Collage$Padded = {ctor: 'Padded'};
var _evancz$elm_graphics$Collage$Round = {ctor: 'Round'};
var _evancz$elm_graphics$Collage$Flat = {ctor: 'Flat'};
var _evancz$elm_graphics$Collage$Clipped = {ctor: 'Clipped'};
var _evancz$elm_graphics$Collage$Sharp = function (a) {
	return {ctor: 'Sharp', _0: a};
};
var _evancz$elm_graphics$Collage$defaultLine = {
	color: _elm_lang$core$Color$black,
	width: 1,
	cap: _evancz$elm_graphics$Collage$Flat,
	join: _evancz$elm_graphics$Collage$Sharp(10),
	dashing: {ctor: '[]'},
	dashOffset: 0
};
var _evancz$elm_graphics$Collage$solid = function (clr) {
	return _elm_lang$core$Native_Utils.update(
		_evancz$elm_graphics$Collage$defaultLine,
		{color: clr});
};
var _evancz$elm_graphics$Collage$dashed = function (clr) {
	return _elm_lang$core$Native_Utils.update(
		_evancz$elm_graphics$Collage$defaultLine,
		{
			color: clr,
			dashing: {
				ctor: '::',
				_0: 8,
				_1: {
					ctor: '::',
					_0: 4,
					_1: {ctor: '[]'}
				}
			}
		});
};
var _evancz$elm_graphics$Collage$dotted = function (clr) {
	return _elm_lang$core$Native_Utils.update(
		_evancz$elm_graphics$Collage$defaultLine,
		{
			color: clr,
			dashing: {
				ctor: '::',
				_0: 3,
				_1: {
					ctor: '::',
					_0: 3,
					_1: {ctor: '[]'}
				}
			}
		});
};
var _evancz$elm_graphics$Collage$Smooth = {ctor: 'Smooth'};
var _evancz$elm_graphics$Collage$FGroup = F2(
	function (a, b) {
		return {ctor: 'FGroup', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$group = function (fs) {
	return _evancz$elm_graphics$Collage$form(
		A2(_evancz$elm_graphics$Collage$FGroup, _evancz$elm_graphics$Transform$identity, fs));
};
var _evancz$elm_graphics$Collage$groupTransform = F2(
	function (matrix, fs) {
		return _evancz$elm_graphics$Collage$form(
			A2(_evancz$elm_graphics$Collage$FGroup, matrix, fs));
	});
var _evancz$elm_graphics$Collage$FElement = function (a) {
	return {ctor: 'FElement', _0: a};
};
var _evancz$elm_graphics$Collage$toForm = function (e) {
	return _evancz$elm_graphics$Collage$form(
		_evancz$elm_graphics$Collage$FElement(e));
};
var _evancz$elm_graphics$Collage$FImage = F4(
	function (a, b, c, d) {
		return {ctor: 'FImage', _0: a, _1: b, _2: c, _3: d};
	});
var _evancz$elm_graphics$Collage$sprite = F4(
	function (w, h, pos, src) {
		return _evancz$elm_graphics$Collage$form(
			A4(_evancz$elm_graphics$Collage$FImage, w, h, pos, src));
	});
var _evancz$elm_graphics$Collage$FText = function (a) {
	return {ctor: 'FText', _0: a};
};
var _evancz$elm_graphics$Collage$text = function (t) {
	return _evancz$elm_graphics$Collage$form(
		_evancz$elm_graphics$Collage$FText(t));
};
var _evancz$elm_graphics$Collage$FOutlinedText = F2(
	function (a, b) {
		return {ctor: 'FOutlinedText', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$outlinedText = F2(
	function (ls, t) {
		return _evancz$elm_graphics$Collage$form(
			A2(_evancz$elm_graphics$Collage$FOutlinedText, ls, t));
	});
var _evancz$elm_graphics$Collage$FShape = F2(
	function (a, b) {
		return {ctor: 'FShape', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$FPath = F2(
	function (a, b) {
		return {ctor: 'FPath', _0: a, _1: b};
	});
var _evancz$elm_graphics$Collage$traced = F2(
	function (style, _p19) {
		var _p20 = _p19;
		return _evancz$elm_graphics$Collage$form(
			A2(_evancz$elm_graphics$Collage$FPath, style, _p20._0));
	});
var _evancz$elm_graphics$Collage$Fill = function (a) {
	return {ctor: 'Fill', _0: a};
};
var _evancz$elm_graphics$Collage$fill = F2(
	function (style, _p21) {
		var _p22 = _p21;
		return _evancz$elm_graphics$Collage$form(
			A2(
				_evancz$elm_graphics$Collage$FShape,
				_evancz$elm_graphics$Collage$Fill(style),
				_p22._0));
	});
var _evancz$elm_graphics$Collage$filled = F2(
	function (color, shape) {
		return A2(
			_evancz$elm_graphics$Collage$fill,
			_evancz$elm_graphics$Collage$Solid(color),
			shape);
	});
var _evancz$elm_graphics$Collage$textured = F2(
	function (src, shape) {
		return A2(
			_evancz$elm_graphics$Collage$fill,
			_evancz$elm_graphics$Collage$Texture(src),
			shape);
	});
var _evancz$elm_graphics$Collage$gradient = F2(
	function (grad, shape) {
		return A2(
			_evancz$elm_graphics$Collage$fill,
			_evancz$elm_graphics$Collage$Grad(grad),
			shape);
	});
var _evancz$elm_graphics$Collage$Line = function (a) {
	return {ctor: 'Line', _0: a};
};
var _evancz$elm_graphics$Collage$outlined = F2(
	function (style, _p23) {
		var _p24 = _p23;
		return _evancz$elm_graphics$Collage$form(
			A2(
				_evancz$elm_graphics$Collage$FShape,
				_evancz$elm_graphics$Collage$Line(style),
				_p24._0));
	});
var _evancz$elm_graphics$Collage$Path = function (a) {
	return {ctor: 'Path', _0: a};
};
var _evancz$elm_graphics$Collage$path = function (ps) {
	return _evancz$elm_graphics$Collage$Path(ps);
};
var _evancz$elm_graphics$Collage$segment = F2(
	function (p1, p2) {
		return _evancz$elm_graphics$Collage$Path(
			{
				ctor: '::',
				_0: p1,
				_1: {
					ctor: '::',
					_0: p2,
					_1: {ctor: '[]'}
				}
			});
	});
var _evancz$elm_graphics$Collage$Shape = function (a) {
	return {ctor: 'Shape', _0: a};
};
var _evancz$elm_graphics$Collage$polygon = function (points) {
	return _evancz$elm_graphics$Collage$Shape(points);
};
var _evancz$elm_graphics$Collage$rect = F2(
	function (w, h) {
		var hh = h / 2;
		var hw = w / 2;
		return _evancz$elm_graphics$Collage$Shape(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 0 - hw, _1: 0 - hh},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 0 - hw, _1: hh},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: hw, _1: hh},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: hw, _1: 0 - hh},
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _evancz$elm_graphics$Collage$square = function (n) {
	return A2(_evancz$elm_graphics$Collage$rect, n, n);
};
var _evancz$elm_graphics$Collage$oval = F2(
	function (w, h) {
		var hh = h / 2;
		var hw = w / 2;
		var n = 50;
		var t = (2 * _elm_lang$core$Basics$pi) / n;
		var f = function (i) {
			return {
				ctor: '_Tuple2',
				_0: hw * _elm_lang$core$Basics$cos(
					t * _elm_lang$core$Basics$toFloat(i)),
				_1: hh * _elm_lang$core$Basics$sin(
					t * _elm_lang$core$Basics$toFloat(i))
			};
		};
		return _evancz$elm_graphics$Collage$Shape(
			A2(
				_elm_lang$core$List$map,
				f,
				A2(_elm_lang$core$List$range, 0, n - 1)));
	});
var _evancz$elm_graphics$Collage$circle = function (r) {
	return A2(_evancz$elm_graphics$Collage$oval, 2 * r, 2 * r);
};
var _evancz$elm_graphics$Collage$ngon = F2(
	function (n, r) {
		var m = _elm_lang$core$Basics$toFloat(n);
		var t = (2 * _elm_lang$core$Basics$pi) / m;
		var f = function (i) {
			return {
				ctor: '_Tuple2',
				_0: r * _elm_lang$core$Basics$cos(
					t * _elm_lang$core$Basics$toFloat(i)),
				_1: r * _elm_lang$core$Basics$sin(
					t * _elm_lang$core$Basics$toFloat(i))
			};
		};
		return _evancz$elm_graphics$Collage$Shape(
			A2(
				_elm_lang$core$List$map,
				f,
				A2(_elm_lang$core$List$range, 0, n - 1)));
	});

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
							_1: {
								ctor: '::',
								_0: 'dnwtsgywerfamfv[gwrhdujbiowtcirq]bjbhmuxdcasenlctwgh\nrnqfzoisbqxbdlkgfh[lwlybvcsiupwnsyiljz]kmbgyaptjcsvwcltrdx[ntrpwgkrfeljpye]jxjdlgtntpljxaojufe\njgltdnjfjsbrffzwbv[nclpjchuobdjfrpavcq]sbzanvbimpahadkk[yyoasqmddrzunoyyk]knfdltzlirrbypa\nvvrchszuidkhtwx[ebqaetowcthddea]cxgxbffcoudllbtxsa\nolgvwasskryjoqpfyvr[hawojecuuzobgyinfi]iywikscwfnlhsgqon\njlzynnkpwqyjvqcmcbz[fdjxnwkoqiquvbvo]bgkxfhztgjyyrcquoiv[xetgnqvwtdiuyiyv]zyfprefpmvxzauur\nvjqhodfzrrqjshbhx[lezezbbswydnjnz]ejcflwytgzvyigz[hjdilpgdyzfkloa]mxtkrysovvotkuyekba\nxjmkkppyuxybkmzya[jbmofazcbdwzameos]skmpycixjqsagnzwmy\nzeebynirxqrjbdqzjav[cawghcfvfeefkmx]xqcdkvawumyayfnq[qhhwzlwjvjpvyavtm]sbnvwssglfpyacfbua[wpbknuubmsjjbekkfy]icimffaoqghdpvsbx\nenupgggxsmwvfdljoaj[qlfmrciiyljngimjh]qkjawvmtnvkidcclfay[bllphejvluylyfzyvli]heboydfsgafkqoi\nottpscfbgoiyfri[iwzhojzrpzuinumuwd]orfroqlcemumqbqqrea\nzhrhvyfxxcsdpris[xdqecoqujrnqbgla]bpwibmrkcfbzigf[rlqtqykdltcpusvc]ybtsglkxrhucxwv\nmsaebhhuxyaevahov[skkhuecthcqtrvtunw]bzlvljpsapsezchptjs[lbcxoczqbyysmha]zdqlfydjdctfnuetghr[owwhfhnjmpekukafw]qqitepzwooogqifl\njhdfwesnofrkpse[mkruficpgplktbmoo]mnrjpuvsauanolvzhym\nucibfxxivatgxlupp[rxlbgrqostcioowo]faiimhdhgpockadenua[teomupxzwrernokhyud]ohsfljkyjvkfzwus\ngzxcgjqdbyvfndfpw[ypfsapvecfqihnpuszq]mvwxgfkniekgqzqid\nfipkggpfwvgrqiwosi[itadifxotejgzkt]szwurlcbvffhgse\nketltdpowbxcusrcua[oonjssgqvcgwvlz]otjxgpizqfpcriuco[mgtgmwcjecomtdkxdev]dnrecyeyhqcpausqzsw\nlcototgbpkkoxhsg[erticxnxcjwypnunco]notoouvtmgqcfdupe[hubcmesmprktstzyae]unuquevgbpxqnrib[egalxegqwowylkdjkdg]spqmkzfjnzwcwgutl\nnesmourutitzqtolwd[rurfefjvljejcufm]jagkqdwpkefkjdz[cctohikipqxxbdjxsg]badmffkslhmgsxqscf\nvvbwenaczgfagvrv[dqjzprtikukbikojlgm]bkfrnbigwaitptbdcha[llnwgonsrsppphnnp]sqozspzzfbeigmw\njzkzjzzghblqqme[fsqzyykcotbavruyp]vjzohzsunrevhmpi\njlngucjirfgdgorbgb[nvvkvebcjahujrwjmy]cfnlrssuthgusytkqt\nkegsdcxndhtlskseb[zbtcngduxclffzlw]wrdqbtrqbcpbeaiqvx[svsyqhkrryycnkceq]ztrawvffepndijceeih\nimtafeyfivrcegpagsl[tjzsewuwboushjl]mtnyptormlwiijlds\nsblhlpnuutqgtuvlc[jlkivbtbkivklrnr]zkzcykzkyjxarepzvrr\nojuqmcidxmsyjkhuh[gsegkxlimzuyceo]dlhjiensaurluhul\nsxkxluastorxmnd[gwkeczwgmamhjquth]yvpdadteadabxgsplmr\ncndxxzfcmwwtcibgktm[ntsvmiwosuvniztv]onnfaenxutizlbxdk\neqiwaqxxstamxgzc[vnomzylvfpmcscjar]rwdqevxpeqvrmvliu\ntvzbzkhvpzedqtp[whzeqaisikjjbezzcow]hqbizwaaffwbtfglq\najwpjiqawievazmipkw[mgfhwrppaxagfdgfsa]iaqcnovhgearcutadns[anaukyaljeflxdnucbn]bhqcwrkeolrhwdih\nneakzsrjrhvixwp[ydbbvlckobfkgbandud]xdynfcpsooblftf[wzyquuvtwnjjrjbuhj]yxlpiloirianyrkzfqe\njugqswdvlbaorwk[dfqvlubdcigzpcz]aqhybhnoukoyxuiw\nkkkfysfugyvqnfvj[ahhqkrufcvhfvapblc]jfincvlxbjivelqrs[mpoymhslpyekjmy]eicbqlzecwuugez[tsqmqvjiokqofbp]senbbdxrdigwcjwik\nogiiiqaxakiaucwa[ltdchlxwnzefocrw]koxethzfvlsewbqdt[qdfqgtzftqpaxuzcruo]fvkgjcglmmxqnifv\nepmnxkubnsnyeeyubv[ydzhcoytayiqmxlv]edmbahbircojbkmrg[dlxyprugefqzkum]svdaxiwnnwlkrkukfg[eacekyzjchfpzghltn]ofwgevhoivrevueaj\nvvwvubpdeogvuklsjy[psnqcfnqhxaibnij]fwzpkbdgmpocoqp\npjdxcbutwijvtoftvw[zkqtzecoenkibees]llfxdbldntlydpvvn[uaweaigkebxceixszbh]xxlipjtlogbnxse\nzmnirrxetiwyese[cedxmaoadgjjvsesk]nuisspyclmncqlasmuy[zxwlwmbzbjmvubgcf]hfqniztoirmsdwz[zlffqhttbpehxoabzhx]upmydjqzzwefvgdpqu\nlwvsssgvvylrvqh[duxjrrqkzchbpvnmm]pckmefvejytvzavgzgc[dcekfwnrzooigwio]pmutxfiwfowlfnnggl[lzytuzirtzgwhkz]yzgxtksuqrgvvgfefon\ntpmyecqhqjjpertn[qomuwmxstmgzexds]ftvqqwsvsrnmvpg[vtpebuufpyieqbhuu]dorortnekxkwnploro[pzajzflqvbkhautupl]eowpcyzmyvnntvzmvx\nfoguzgeasrkncbny[tlyweucylxkswwxb]jtzjubgewwhlddar[dkddqrpwaqvlhdp]skkegnatbjubqglwu[pkwscrmgvjzarzb]ibaagrqwnxblvtkg\nejgpdxesfyoyaggmymi[axfkdoyoqkpkhusfwe]pnczsmszqevkqiwlfc[dqhzcqjzpgnoknmv]ldrjdhopfyctlqtn\ngqhyasteoryuofc[bhblyxlbiqtzzyzvzqg]dtvxrlkyuwxttyw[qvvzvuzhkemwglh]bopvfttkwtaeckq[vvhkkgrddaoxnzctwar]gsscsjuictekguq\nsviwnvbtrgyydtadhz[ipjrrywkoxwuzmlrzd]kcxruwyisqvokporkub[tvarlltnhjmcuvvcck]raafszljrhconjqsqi[snbxmvzrkojpjybkgpi]ekoeuottccqbxrvpkb\nvtouviqjarqwnoexuy[lzxhegzxptktueqo]azfsikzbwiajcrhnas[hvqxgtffjyyfgsjowxy]ddbmpksrtghvvypev[eoepwehfavxzwgt]igsulpdhrevkghzh\nfucimprxzsubuuzmk[umzezmmnkfzvjlela]qxzdlcryifsinmkgeha\nkauzjbailyzpvtji[hgeslalzqgpdkpuvomw]utsywinellykvmuawwr\noacbdgfaszolybf[hsytrkjoylrkkduzfz]bmoelqhppaxshmfjl[cusgbbuydfqtbbmsju]mcftwalxlvfvvpeu\nybylybngqxxrmplf[mybpfztzwnisfpfgqmb]fsllclehoezgthek[ldxhvhwniqfpqbl]ebybalwrmrqldukb[okenxoqxjgrenrcjd]kluumgtqybryflqi\nmufsafgfxiegfgf[ydibrbrmiaulexjek]ouwchrlvilmygbuppjl[imyaxsiodgjteppdyy]ugondbuqnhjrzzzn\nidihouejjocbahe[mclnirhxghanatge]ubwhxskdzgkmyrp[vksyktucsyumvxoc]bregaefrdlrgmtwt\nqnsqwkqttdevlnzg[noyxiueharjajsalnhu]heaxmujxhpgjddqur[xnqwujjeasceovnroiv]hnrnwuogebatnfsa\nevruuxfhpivnmknolsj[itpsnnhbtrrbllsbo]gefodpceljlvwuahz\nebddlswrvbjohtnkyip[qkssdudizhcoaazvyow]xvnqicorrkjrnxixp\nbbmmzbebuexzmtbr[tpzfxmwgamhaikfpaeu]kraaocehdtalyjrf[zzqqtjplepyidohpvx]kzehgejueimxlqglfj[zgysopfdgxtokkdxwk]gwcfaflybmhdgoxjq\nxztpwfipuczrtoyt[uwnlokmtopkhdtemm]sdfmvgvctgwbdjpmvhh[ozjpkdigpjqzqgy]yrkwokmkrevauzroaqm[vctyupmildfnnjomue]cvagxsievhrukgyqzg\njpmvqhuabqsvroxgmyk[toieqxrazxhhsbrm]wdwhoqdddwdacuo\nmlaqnefjmwbxeetyxz[sziklwesunikpiqjark]iltkcgfzmhvusdnlr[bmfprkswemctykvio]hhsmvppnztgipxij[kvlbovfklljaumwmy]mdpaiazrlputabj\nczdgmoqwzhvfnulxo[mlbkytxjhscsxrgchri]veugcvavrzihzencp\nrbjtyudgcswzezr[inlznakcutfnnequc]uhisbxotgqqtzionoq[hzlgqtkpeubvudi]qqsryagiowmcijbejhr\nwkvwdohwocizssun[kimsjrwwfpilzpkf]ruqhrplgugwhmnn[iouhwbjnqzlqyewxof]exjuguxwmphfypvsivl\nbcnuloxdfhnyesgtdky[hvmgfzcjhhiiqino]sfipughwbebgstwrua[behnamammdxrnnok]ttpbmbflilacfvwiwd[sosjbmmjygpbfetziv]qcosdgrbfdsgqqrlhym\nfbmthzppxydfxiipo[zsyfzbueqoaoxeueado]santekllapuywlmwjkl[yfsonktbvuyilcxf]xjerezinsamruvn[cceqpogyrsztadfap]fiivtuyynltqoypypou\nlfjigofbbnyrdlhxv[gfblbnmkfnpxbio]zeqevpmpjowrxtw[mofuoyllwekzcjtxjhp]lnzewigzwruzlbjh\nxjgdfbtgqmgazgvtif[farekeencwufapef]dxjltmtfxuiydactuko\nnjaolcljynwvrwy[qplxbpadtyndosjcch]fscxierutuanappsqiy[jftravlojauqkmgludp]pkfwxpdfcrjrmbucf\niyotvokljqynxnpjsfs[lfwwocnwcwstidfpb]mutsdjbqfruxxprzrnk\nkpvxcagazjsxgagg[sabugyxucglnvcjb]uvrdglycowrjddy\nzclgitkurpfdspcbk[yedvkzgbawpthoyn]dhvnmtxbrpttrdrio[drdahsrphffqsigrlmk]ykghbvcdosmtcgxdeb\nrkmajkdvlbqwtnuanue[brdlutivdnfekggixum]pbsgstnxgghrygqwpf[rlqzaflmkbvvefdoc]jhbtzkodsfglsaow[onlllmfziapizsd]usvejrxmziulunvjux\njqlketojwcgvuce[ftcxdqqebijrnfzjriq]ucwgiavuxrxokmvxgad[zmyusreluasvwgzngmx]semjnvafnqvwtvkimy[owvczdccmvfohtbijfu]dmhbiikbzcualbbs\nroewzhbnwyvondnn[ejikyjgtzpmepihnnl]yurjuztavzqkxqlrle[mbjcyqrzfuhhsnipzx]fcrtuzhrqorxrdmrcn\nycznijylnnqwmqzdd[ycnztjgxgyapvafhwaa]pzdtesugxpchhdb[sdruhgxaqpitoxlncc]exnhjwmnvqmquvclhu\niufdjzqflteyvhrem[eqiluhtbfuegasby]ikqccaxrpnjjrevdsev[wfluwngzffaxhaflbf]wnlyrgvaxzsmqvc[smkdicgtwwwxmdizdi]joaqneodtgvioxzg\npddsupswtnzture[pehcqhpltqocptr]ymzrvibfbeasccxh[jwwhastouxzmyhh]xsllfxcuzbtciegzcd\nrnnvfdyavlqnvwze[aistrderxrrojbsspnu]hfkzgodowrlajmmeq\nqnebfycqdylighjpgo[ablnwbutiwhdcrmwbg]hnqeseogqdsdhith[nmrgaeenxhizhoqper]tjxbhutvqtjzpyzh\nbatsftctktgebkvzv[rovosiyqqpafttgdmoc]ynnztvhekfnexdcuq[lnevylboilqebnkf]udftgymwddomqmy\nybrcyivzafzoubcj[crhigqvjszwqflocc]aesdfdfgzcnyxsmzg\noskvnzcbuyaytyixp[ypctohskpfoxhpydwpf]kgkbxhyfncznsar[vulxrgolpxlqzkknzva]ightbuekpmjodxzfky[nyjpxhpycxjrqdno]jhvrgxgfjwarwzkmfj\nrelqdjmixussrbijgqj[mfsyrfbtjbojcesuyw]wsckbuhopguszeh[unyhvpqjxxgfbgyf]dddjalolfjwliasyezn\nxahbldxnvsviywko[ucmjsyoejvcggbtx]prfpnzzlexpolsgsmsf[bgocwabottcqekxs]ijvpreqlfejnqhfbi\nqtcopopjmmcjlyfrtot[dmnfjowrhqtqhevs]pfczfmefcnnfbxiovzj[exoentzecnbfjsy]comgdcvnlyaemmya\nplhhfkjlotvzupi[ilbcfjbrxuildya]uuvdzteoijumhavq[tcuesohvzusidbgpw]hdsgdngmjtlybnas\nyoifccopobbguvkytps[xhkzrdcfsyhpmuujbt]ocidhllwycinggwu[kouoyzxtwiwknduclv]wkokzcbbqvjxtubqg[plgujclgyfmafflyurt]rpjrpxriaxyinneajvy\njbmiqrqkpbjasqhvwcv[zlyzpnhzdtqiorod]dkigqgjtzmpleja[ijenfaygzeceopbmxks]iwzcpoekmitcckbxbzr\nzixveaipmutzulr[awdlukrjbyxtssfksb]hreqwpgrawaqwtqpt[bykxrwwuypetebhs]xhtujigporvkxqot\ncldscqwnyjkrzvyegsf[zwsvoudppoalxeja]dbqrfscekpmhmpoellj[xxxpuyedbyuihdzdf]bmtfdebklpxvuacq\nohdqlkppqasvyrkkjm[hevshusrmyhuyyo]qbmrotalialbvje\nnvwdnytzqwrugam[pflhibktydncffbnlva]lguqdlkusqqwovr[bgufsrqjnngbwxnhuco]uanvcpxragayfoj\nzkvrrzmgitfjnit[gezdzgcdvxdkxytcq]avznjhxyjldbqpfoua\nmmyxbuoieontkaxvnk[lijzkcghkhiryhceqc]zuouxoicowwkhklyp[baqxxkavhepnpepnj]jcdekzxrpfucavdq[nxrhabcrumlshoitzba]httcbsbgoyhjpkv\nhpzoxihsevceefdjv[nxgkyykcfpjwtlz]lkszzbxqdrwyktr\ndjqunzvzcyxmjqhy[qapfiyujulhgqipfm]htqbtlhlsqxnjyply\nlilhndsdretyqjojrn[oxrhvlpgqiotmvruvh]hgdlazecfzdrmegmnw[alxxixmnnjkyhrqjgh]mpbjuwwcyhdfxynyk\nfcrwgutcgcqizev[nwszwhfvqtdhrymgqf]iiahiososrpdafnt[gbkrardsossgcvu]fmudukrxbiqyrpi\nxpcgsvaeydonptb[ewpsimxlttaeoth]gersjqmmdamhikqtv[sxyvukeegkkbbarjknr]sohijvshdnoawujw\nvnjkhbmpsmvxkdt[yrpltayaihgspvnjxb]ivhwkahhjjlwzxfpz\nofoancxlupttxku[hkedaqsibrvtvqu]zkssllvuecmgtqvs[eklsqwgwuhucbxykl]ioompempaewmnco\nnwviejwlkyokiqhuvo[csddbtlbfdwtakxlmss]fxdoqlbdjhoslraj[shasfhtvpcsajdsmxfp]errsdzqcqzbrfnkeux\ngvmytvlyluvnmemhgjr[bvqbhytqwpyemefwo]sygljhpvyjnuxzjqy\nzootaoveazcrmtbda[qlxlwntntbkjtkqve]vffdsbekufzemgwomh[vzllvqlmloffyyldfh]alltnttrzqrchacoiqm\nksbuxsjkmtzsfsy[shracmzkycsuqrei]qrmgsndwzkqhtojsn[innhjjhyfsffgsboglx]zhwuwgyrwmucjfii\ndagldnrnugbavjwiiq[vrsiyprmsvuapxvn]piirprosbofdwzuuhn[epdsrdcpgzkkzdjle]jylrtjltlmvazfpmh[rqqteknolbyzykdysvr]ieejzvgtumekqapi\nmtamroysxwglblwmjn[gmebbprtzaogucvyzv]tjzuzqyyfuihjubuzu\npcfbudkakpzlyou[zznswrvmytntytfkt]kvudoarqnyybzeddvn\nmoelqaykzlstyntby[qmpxihbeysykajdo]omqcjgdbuqvvydd\nddyczdjdwnoacci[wpgjlohduqnlrifih]dfwcghvsdezgdixnpxe[ohhccenoirazgekq]lqtssqpzgusrlvyrd\newirhlfcfhkqbvmvi[ixrorekrimzzkckpel]ihyukzubvqdpnmqpgu[mbtybrusfomfdhlg]ucrcmbvpnjbghnxdo[lyajfieycgiubui]llelwgnuopqhjax\njpltuunwbrijwnudg[ejxyrxniclwnqxxnh]krckhlysnmqahsz\nhkdpdpshmftvxob[fsdhonsqalgpydpub]dirxpfxsxhpxliqg[tvbhlcqkymtbnytjp]xuvawokttfililgwgue\nmdnmunbnueofzddapl[wxfahokzfixiapig]wekvqzgvufgztlgldh[zwglgerouhvhtbrdib]xeogmvaqszvkdvxv\nmbqnuqonmkxmczjo[ueqnkvfdskaqwesufs]zmoqtlzfcwqaxdnddkk\nqoaqjkdsftjstyjyqd[fyvizziweplccjt]ryvpqznfcdvjxuu[syspurpgsonxbbdrcc]vvedpafqmoeugwuize\nctdgzypcrjqxirm[ouyjhaohcueqwdez]kroowbthpspnnzgzuau[pqijczlztofszvdzhx]iccbpchemtflqnhdrnw[esvbnyvlckqirev]psrquqfxaotuzsojbt\nrgukaurlmsyzovie[noclopxqrusykxpix]zbbopbxzogbeppp[anouobvemneuuztti]rpnbuugshsxxbbkhauq[zpqywyyxjfabzyppw]ecdrhvipvzregbgl\nvmbtrbtoajfkswgy[kailajjwltvmwasynoq]goxmpryedtsrgkx[hljqifnoadoljqtub]xucplzmspnbxvliaap[tfqpmrhbakiidoxwa]iceqprkydjgouemqsmf\ncvpnedbnibipftign[cigxthfejgyjzvspaam]esifvgljjjbexwm[uspsplcqhomoszleq]qnogejwqjdiznyfellc[sszzsifsfavntyghfs]btswodsrhcrrbodmtz\nlvxwpuujqxypkhqfymh[wtizujakvxzrqwpols]jffeswrfpnhhakyhwlz[lzyloeveicgwixnvdx]uvwhpnjlszclssbf\nnoblqdnmgtyjbxjq[chxjibegmcbmljibes]edtgpajthcmqgpz[qafbzkjfqbjzilzh]aorhwssnugyflolh\nhunicsoijinxshpfskq[lniiseazhvpjiyg]wirqusdwvaiyatimhx[jntjijtppuekuvvzz]mxebkmgiqyfaglow\nwvzgoeqwcuudhjlc[nsjqegpxfiwvbtyuo]hehqjsarzkbbidy\nncjcjhyagdubxcibe[qpddbjyualjarnnpkf]cizleaqaaewqysxwys\njqslpqaqntewoglud[xtzdawarqxbigpuf]qnxdyobxvfsrwoaz[snegbwbzchqcbavh]kipasixtzznhgkjskv\nhptaschabsnqdgmuzoj[satvzxkqetnonungbjb]gqhigqimupvihhwy[nejqgulbxtzfjbjlya]jywahuqdzrufxenshjj\nsjgpoxxqtfsltzk[jqwzhblplilweukbso]tgorxisfymrcgyr[tfbebfnnljlpcfeps]ahpjfbonoajtohthzri[tdgaokthtdhxpsg]ajcykosmkhftnrjqphg\ntnwtnvvrpilvadiy[taucexvsohfmaxd]cfhrctuhgqwjgtll\nxzzmvrhyhwvprzczwz[lnshilvbyfjqgff]qfkoodzijhqkpuob[iyyvvfibosnuwlov]fhbcvpuqvpxmlolhry[osdmjplktygtobvt]msazwlubhinqvyfh\nwanhwievduqinfwlcou[uyalesnoaqmajcc]zbdddgzmqprwiia\ndfovljmseevxcfarf[enpclythxgepfzqcw]wechankwzxxkkutq[mvzawbhttzrauulkxvd]emcdawwiunjraebra\nsylgfxqcfrqgeeuh[dljwdydnbuddmtdgp]fhenkxvmwvdyaukaxa[xcdbxlqqfgqtjyhoi]tbnpjbnpoxxaxef[rlnmcnmntjlitsmn]vkculrpgrmqsrayre\nxexefhsfpwtpxuygp[omxfywhnlcapmpalz]foblbhtxieggkgpcru[lscwcbkqvexwzzbri]ipjoiumgoyugfzq\nhbeghglpgqnwpxqio[pcujpvhzhghnyjkmppe]jwcnwmqwctqgoxpj\napqmhkpxrtrfwulqbq[trthojavkcrlcgc]oikizlfqpukeudv[afgmhbusoqjubra]ajbuhxzuhecopcxm[lowqlmwiyvmdojjla]jrrhjmopywkqrhlgicl\ndxrqnbrkijtvmkwq[dvtqzljjbreayipqgp]erhjjvypeyramuaab[cjedbzbceteuydrps]kolgelhdemrbeviu\ngwjakwyuaxixflozol[omjuyjzbtditgoznip]nqybdawthoydext\nlcdwaahhbhajoai[cszvgduipwduhgmo]vpsgnhmtypusbgmhwnb[qitqpalswmqvjiu]iyjenmmobfasnzqefci\ntkxizzrgmsxvmrdawsx[edbhkciwrqmoflyang]nbuwbbspldrfhic[guhvpvocfyjpwwclv]olxhqqgrylvzzqxxd[cnhwdegsxurungopo]rdenofdlpgilpiuvmr\nwkadrydzokfmuiah[mihkmnzzjladulkvb]weqzktdsbwalcdijda[rejzrqqdtbvrwgbgojt]ggruyvfdesfdwenyx[jjyyleykqeskpfmzl]ssqauxmvzygppvncz\ndjzzsqykcfbhgfoq[frykddayaohlxmkem]kawloxhrgcpronph[xxkgjvdfespwmnja]jddmrdznkctmsmaxih[uxotxlcobxfemckshh]irmewesnknuknipl\nhzojrovrbmfobhsau[itboujfkrmpgjpsvsr]qgczawmbunmisxs[dtrvnzrayqlvdpyzbuy]wrcsquxgcxpvbwwzlqo[kqbfajfleopglhfui]bsoomwrdifoekal\ncntxerwyrvbludhaa[fclfiyjfekdtavmgy]lnvvlflygrewrgswx[juijxzrpwfrmshbttg]yjeuhzyjbmbdslbdhf\ngclzrtvgfbqqqcl[fdkwmnpoansxtklyusn]ywwzqahbabjbcbzd[kuiejkftwfuzmjbiify]tabpjhaiwzcdnzvof\nhmshguykeqstxgzs[fsnsxtrvkdyrlek]rkzkooteryozbwmda[jyjzddadewtuaqulp]gtprcoocgdsfbtduekc[llfoixzevsmexhuitz]ppiutxxuvaxhzgiib\nouvpvcchazfdcljaux[kxqnkynylosbuekz]arsuffkkpzlwuibqd[lmmxhndkoldfbtyfpw]nvcrjoborzogjhgwn\nojesaevpprrzqaksixa[ykxbgapdjiulhmxgihm]nrxxnhdwodfgqoeproy\nvzbltcugyxvtlxqnkxu[fcflcasuyaljgewcynf]azqaltkfsglwgkeh\nurcslegrolaaalf[grobiijzrtgpntne]uhpzjqkslgahpkehix[prmevyrajmgfhsjpag]kwfhbrhzkojqazxjocg\nzwfeopovkggasxxb[fadbebqmbxwktwfdeui]ftomtaogfvgkkdrkc[rdkdznntsigigjiv]warlzbzbnfbjjsh[etjzyzfdjztsfsyi]dulnqfxjoewssxgkfb\nnvrsqzcyguparczn[ewfmgkjaibzjoiex]kpooaykofbtkpawayfh[ssuzuankcdhqvold]qaeuwxgakqvcugn\nrnlhwrnjgxwleghohuz[nktpaaaciwyfagkpqw]yeyzojziajnryse[bmpxxtaljjigfiv]ojzukghfhfhykqrcdyy\ndoqbqcwjoldvwtws[qaxghysnphejfacrnkn]iqyhfkjogmrkjpk[hfjqxqeuzwywwmnzj]uzhpypjadzqcpeibcgc\nkmcmhdptzlhgqui[cpluzrcwihnwxrsdoj]czbxutspkzdwesrc[fccnqmeaqfmxtqqng]fitsnmdmyzwsifevbat[fxhgcmqhxrudtnleoww]yhxgwphkxlzhxzjnvcp\ntmjpplcwhmsaxav[epfnxqdzfpxmaztdqn]vwdoatnafiotogpsxk[lydghxujguhqcjqtbbk]mtvqsesoxvybfrxyoi\nfslvgbiibdkhchajyb[zpbhqrokrbfuqrowop]gqqzoqvfsdfcjcdurrs[xhqfcfytbbekivnvod]jxjwuxivnyhppvfhaol[evfnrmrjnnhychtpv]emiyjcjsnojxexs\ngqaygymjihevbsps[iepworrljuepufyvne]fzfjulzebpsphczby[kxaohggiqnjpdbf]bsjfluhncewudkumaxj\nmvjlhovwivdanexv[iaphahshtwtnhoeoqsk]syolycabjeiwtwtec\nikhcujftlekmcnmcy[ubsoslmlaitakaqb]ruyiqnoobymxiim[ppxtpuphuisxnqumd]qxjhzfwvixjjmfgaqej[bdjpilcwzhqphfumpny]itvjttbjsbfmxppif\nxhemwtnqvfankrccdtk[bbjzsytqxhxcgtedp]ksfozdggjvyvpoyw[tberajbwhcirnenwv]juojuogrifenjsbldn\nbczvqdwkurvezjxgrg[yjvuwvfypobetomm]vtfujjaergrizoots[snwcbtqylvuhnxyvb]turadiqlfjvclpvbweg[mekdlejerxpllbf]bgkveafnrceyxufsqj\nduqeascyrgxyhlspebo[kzimyrleaopbbwmbi]xsxqyleqvoscazopte[debdbibiuaosfdyioum]vjaptdzpitqctukwhf[jffyamdmvkrggbe]qrnqpwcdoditjixsc\ncuxdugzthpcubgw[qjvtzbgagyebkobkhf]tsbcghahxswropcgj[yenmfdvoxlqekjsk]kjdmhdgepvdoovzvg[mafjriyxqtotmhxgvty]mdyayljihzqxhiga\nehkhfoqcdkpyxeum[xvjaglxwocodctbzj]osufidsaijsczhtfg[rvmapxxierwnjkc]pgshnzbphxdoaitou\nwagqtjalswmbehwmuwm[oarjxyzwyhxzhpgilh]qapupwvuflcoryf[hmqhnrjiahzdfbaz]kuprvbaykjhqagnl[wfxatijeapdinkt]hadtvdjbkdduycdut\nemfkovpbnkaxykrmwjg[otoxyqlkgczzivgdt]nsvpzdvcbsvrbpo[vdfxwihznfpxlbsju]xbcniikjhgzelav[opidnljejcjawbikt]gedgtkiksnpijteviu\nfxbpujpvuboflfip[dogcwovzlakonhdyww]tkzftiqvyzumadasjtu\nrqtkvmbmqtdrqsahsdy[dhaassflbjfdslopp]zetcyybbahysvheand[uncbkqyoidhvxjf]mxqjozeotsollwolhs\npxfqsysywqfsmername[yfcktnozutkhniqyp]tjzzakrnlxrtscena[bitenzjdqfopqevroqo]zujogbgemdxiaven[dtxlpfkysfcivyrxqt]fsgjjgzltbnlvdojqvk\nguclyozvgpvbuhktwbh[qmueutcpmdebodbilp]vglsdvkxogzhzewjpl[guoovyobczavohc]jdguogegerfiwrxthui[hdcvpajqgpsoxuoawmz]ztwnqkdjnnwazrdzpc\nllcocydhktglycn[aqvpbqqcyyjlfspio]bfwtqbvqbywnhvn[bdkrsfpiokzttiazuaw]kchhszhegdhxega[mgfuozyxaqcxmillwlx]mzcerkylhvawvyujx\njceiyppxbreywlqlc[fizmzubzyefdntbmd]bmholmqrninpjuux[wkbshvxwlfhlrpkbk]bnqhoqtiqqpsibgykwd[ajvhuevpxmsrjrdwt]ejcwhcsechltmxlycwv\nlhzgbwzjykgdqwj[ksxhpuzyromwycwqtmi]fqkgkgvjfshsltg[ypmdudbfamagwadtia]nxqvzfdgxlwbbkrssc[zqmfrjzhsztnqbdgo]dvzoywqsqizywigsqsm\nvvnbnhvgcpquhzbarub[ufazesxvliazvkcanib]agtuglmgoxupumcispr\nmtpdvvydctgradgywc[mtpimzrgtmnlcge]vxbxcxjkpticzboc[ffiyihkovkviqjifrnt]yhxctiahahicybqti[latcrvinlucwkxhmc]ajivvpmxwiypcjtevwh\ndpnjvkzcoyyzmgvvs[gtjdsruwdhyukkx]qndpbpmhkdngjmab\nraugsxxkqxpsglitbj[ncskiewbnqnhxvojfx]qnqtemgvotsgnlgxyb[exshfmlaagkpxueykd]vgcwastyxsoddgu\nvtmkqugezjlfpad[ljdytmxdmcfjvqus]zwkxtirtowwwoqybn[wwbggxlelxpmctsyio]ojizduyxsklhvogj[wkjkwbzdmusrmnwuq]dnvercuduocxwzzqvc\nkcuaibmbtowdpkk[behnytmljmvkfzjzx]vwmeazoaavjnyopedp\njzmgdckgiwbhbits[qapkyzlxkcinhakr]zymyymfbxgiypcn\nkbcfgsoqgqvurokxs[ygvbgzijbgfeylxvl]xsjucuevvfddgod\nunfolwpdrbsrzgoo[xcskhiayzcpeegqfoe]sqhinsvvbcdboctc\nyclpzeggejjnvkssg[jaxstjrzmutqmaqq]buvqcwkayhypitxnmp[hpxwubjyepaqhyhud]qhqlpdiqdhhgffsgtqw[ijhwhbvlbixaeywd]fwpyiwyrgoquoeuicxp\njwgenomewntwyxiawpa[eqcukoqwwwaruuaeoaz]przxcbqvsrozygtcyl[krwnmcxmgcgfbvkj]pcifuzymidokmsecl[wetuprgdinttljgam]wiiixvydbevhtscp\nvzuukbqyqsivwpeeygi[bsfyvyrjgidexcfzq]wyfowikcidviqqnzcw\nnsvfdglsbfbwlxfpfs[hdfyjgnwdgeropdfian]gznlvhnfjawhokhugz[klxeguqtsnydunmtj]gaauhesdugovoftjb[agqwktizuxyqgbvt]zhbzbgfwnkahvueja\nxcnkdghtgpxbfefay[iekwzcvfquaynjpflf]rfmwtjyxputzpsgr[rxbiyhzboydmvufaz]vbibxkxeazvkbzpnrqv\nefxnnxokdpeqbimle[sygsnwvurqpxovmfv]bfkvfubmjyasmvc\npvyunauqgvtigep[ypayrmkixxbagcbawlh]gsvqfsxbquttcaayobo[cwanbliqbdzlcur]ckdwzoeeeldqnmpnzta\nuaxiegivsmmvixygiih[bwxhotmjiqmiffwt]ifggldhrjitovzh[wtrrvwjwudasapqdal]zegculmtzsyaxytuhih\nhvikzocatynjoxxzjrr[yowwrajfokqlojraj]gvquwhdppqvtcvd[sqcangyggkdiljktl]fpjugbjlanzohbvfylb[fxdhqobssfucfmeaz]mzrtcejhidkqkpqc\nlcgelocktqpqhjgon[vmfhipgnrbypfellki]bqgdqxjnlynzdjogpbk[ppgoudyairolaaomp]utxjqpmjzchqdhz\nmtfryyrtmzzlooy[qltyhniowpskiqmolx]nuxblfnfrcqtjqfbzi[bdslgcpqyowecpp]vlxwrojvicfzzzfb\nwidpcxggzgbkofmmtkl[bhvmncpisdisugtk]azxcnslcqsbtyufnt[lqwxnibqiwuwzwkf]iqnupikuhmhvvhf\namceoqorrqtczywlb[znieihkpkxkvvqxk]rmoexicvufbvzrcxisb[nrrbalocuvporahypgm]sapytlndnufcmsmnl\nldbwysbqqkcizwlkqk[kxbcvzlolkrtyzou]zsqlgwgtcvtkmrc\nbejhbhwlnmysyqgzk[gombhcspwwomoqoprog]zgwpzkhgbgaveqpe[kldisefosjggfqzo]eiyzwmdoqqsrpekrs[yoblfghskpxbimnq]ewghiykdpitzdsydl\nuxdgjfelalnofqouoee[obhlfmbrcdwvtgs]hgtqhblpsfyxxdmruq[amhlljtgsqandpxg]uftttypexliymsri\nxwcoczwpeprblqvdsze[fcqzupldpqdpibi]peaetflnafpkrqz[aibobqkhvfzpwaajxj]mzlrkrfslubibbu\nfpofuivhqvybvczq[zbhaursvrqknspvj]zlovzphchihqwko[bxcpnqiijtjpypqk]hmdzgwlnervibxuz[hxskzadaiwuhkjrvia]fqtcewytffzarnbdid\nkqzfapnhrgdwnrxtwcw[keiqggcxbtzwrcvrvl]itnkudvtbvfwlcvguev\nfolpqmauykgkbtb[sajzutpltmpwuvzu]qgkgeonxzucthfluwfz\nqiniyhvlxrpcbscgf[mmjtkliysclrogfxsx]snxccrqkeuqchwfi[wbbptxydvrbgemquc]uyqttlcltqvqmhu[sawrjbeubszmuwsjuj]rowkyiykcizmcgha\nxafcvdeuuhyxixxn[abpngbyvpnkmojksc]anahdcroysddmoxf[tasztimgjqwkkic]fiycikeddfoyafacbfl\nfzmscbkkolwovgnjeb[qzholetigkxxmnmkoc]ffztdtemtdnustwuu[zjrqslegqkywtcaqod]qdtqbyfhwehdezedf[qqvslpytqtjuzrkc]knqvowafliildhqxgex\nhicsgtpdpugetplbufu[lzlwcptzokxrsxtrl]smxnwfvtzttcsesdu[wmucgluptdavbca]xggqqcfaxxcagagkx\nhwnfzlhdbchsmjwaytr[xfggqnxtnpdjzuyqm]efiweqzxmsxetmyjnhc[mgjnkbfmmvyrwyocr]jhviqqnrgzjsdmidsjs\nnvouetegmutetgw[keqvyocxdetebkcgl]qfhnyfdnjqnklpad[swuvsfhrnzsnatb]zjwqmrmphlgwdnms[hdlfprihcbcemfn]lrraefojxvtpxljil\nfowkqklueytawgdxklx[pmrpenfrmskqjttdqiw]ttqjijvoxxfxrrdve\nnsyzzlnqjssmirvejh[gpqbubkrsqphkdjwg]gvzcxqgbvhopkgy[nzlfaemkjnuwvhul]vxdiuaimpogvtkx\npofmqefryoxboubl[neoxktodwrswfsxwruj]frlrumshrtcllqqf[erlodpkifgfpjlbl]bbfocfbyqjagesavoc[ajasttvajmlfwec]enqqcyveejcayzw\nrqtdsfpdgwrlmfj[nmeovqshevzueyvd]ibiplfpvkyxvacl\nwtvwzmpwviqbzol[oqlqunyszsyebxbm]ywqypuyvaiegekaok\nijcorxkdzocwisjb[qvcjrwytrzftjicua]buuniicmziszwzikph\npplaiaulcciebujjsx[hlyeskfzscwmeqss]tuuolvvbnyymfmo[trsqblvfyagxmgtwfk]kcigogbmkzsjlsrj\ndbsqyxlovoghbra[lwqmeeclsvfsrezsed]odqamvyyhsmctpqegav[xxoamahurojgqse]tngvfzhoprhrxsccgnu[zwwglwyqrieusmlfmrv]tzfresqfmfspigfeo\ntmnutczqpsydibk[skiokxeqdgilzjq]rfkxwumjpjulbkiz[folgircuujlcjhjqxa]snhsgynrkjecrsu[vukuvrankaiilqegzup]clzyhjlcbrfdbjrzlu\nopgifufncugjrflllk[epkqgmpkzdijtdedk]xmvotyghoniyalmmg\novtwjnqubjphsgapb[cnrcpnxrfclncasoeka]duqduyvmbzwdopyxp\nimtmstorxxvbvmz[muklxeyazsgitgb]sjuudyrlbxgtlph\nzbnvlmvzeitlrvclu[rwlyxjkxlvgeyfzdl]uzlfzyvmybjonpqay\ncdxryezdoiyoopuzgl[rnmncixgvbxromitr]jgqlptcrlpzdrqh[sstvgpzcldcmoslnycc]cyrecvckpuyjqifsuil\nacjvnpfqosyvnvzbjyv[tmnczokfkjaxcvwjo]cszegpeuzanwadl\nknqqmdktrcvcikcfvcg[lnsoisfwtfpizbpo]xfxuxthdxsekjpi[qsroiaojvihodgq]jaamntgiaqvdasnz\nmqefdyhtbqynychpbh[rrjozrtcexpbrpvfs]dotleanpfblcxfltod\ncoayqpuuvtnwmxzhgnu[fyjdjtselprfevq]elfqjzpryzqsyqykkb[utrizxtivhakgjoeryu]ozeuxjmcorkcejprcr\nybbgylmtmhxlhqizp[uvknavcimbacgtcaq]bcmdwwkdvfnmnunyp\nxfdywwnnhzqqvuywq[drtdcfuoxvlflptlca]oimttatgiboynmu[sdgkeffjrteokyiby]tdiaadhkqdginrtqpq\nfbpfhfecwfprygkwu[hvqikgwyrdwtieahmt]dvtcvnchfsienpasxw[ybkvqrxztwzpsnz]aecndxpzpamjkanchaa[gbjwjnipsmepfxpee]wqjnfjiezpzacmgf\nadwjbyiantljqwsixso[wpjjoobofoumdxgrxv]rkvrcmmrlditmjtsh[vthldqtnlpjrqbobzs]efwiuqkqzfdxyhvgim\nhbbvxnhhxsvghuh[fcrgvyndxojknfr]twczivatsbiynqjxeby[ckqrjoolqrxxjgejzua]omspfwphybvgiqpsc[hmnpdaumzrmqrti]sdysxoudxhpllkknvq\ngfussckpoykcibjnoi[fqnfbkgojenspavpz]xqwvoktikoqyzpofg[xhdumbvmqllllthhsrv]vattqhipurbfvlk[hbebbjewrlmxdblgq]dmdhdbknmkouvie\ntupwpbmrvffvqbfiw[rqpefvswlzjnphduk]mvafdoftaeiojrirv\nbawbqabxqwpswzezv[cjmoppcjgifyfignuf]uawfxptpbgjnqbv\nsekswalpvwmmczwdxbf[wmcngumevhrbffuzwp]tqwvmkfngyrhgknowv\ndovrepylcvtomveqe[vzzskfllpjbvrvrkryl]byjsouhntlopqffti[lqxrgcqywryeexyao]qsukbxhzoifswmycw[rktzizqtdvetwyrchc]vtsdazzrpipfcrnxbk\nydnkchnxezkalny[wlfhmxcboamfrry]rmzprrgselhmfbeamf[dssnudvuvyhvzyacu]jyzdefurrnaqrfzq[rnndewpbutqgejcy]qxuganmeckxcpdtd\nxhwdvxmfxmktgaz[qfzqjtuqokjeznwalq]ddgmotioparmkkudqef[pkgzogoaxvcwsao]cyebyhigpzgyclscf[qehxqzuztsluyweopsq]tikkkgtpkewkzzkdu\ncygqebguktathghp[qlkscioiowgqftpd]ytftmijxsnhgacfmmf\nccuocdvpjktkdceebi[pshiishnrprqohwpt]bubrhtrzuabpzzvbwrv[msdeugbygsvewfxco]nzavazcgkniyxva\ncoscymyrfqgisrge[oggmfoqevlabvhm]xfyhzwpfzhhyhimqkhz[cybjjylavqoqjyyoy]igzwdivoxazgajmiy[kkxkhfunkpsgyvwp]isgotyzlmyzfqrij\nvaezncmuzyyjpeomif[lyvwvohtlkcdyuxze]wzdkddeqkxmqbqet\nyxcqysoxpbwjlqjdp[jinwxwcdeflygawd]hgdgruqilmuzuzhsg[ivpimcyrtifudwjgso]ostoopidgdzcrzzyzts[vvaiuzzuzywesuzk]ccmdnuyihasnldexf\njhpygjolrfstkxwt[krdivayaqwfuktykopv]dmposdxasvjkzjesg\nlcprcppxkrnwuytdt[wysluivwtmytfgqpks]orlmxnkipofpsdteaa[vroskwwxeeylirbkna]zkeahngpukldeszwuk[harebfdcelqdbfemgo]usisvvczvasjomnjrip\neybojdjnfockfbsdjd[xjxxevnxuwjdamien]frogttytivtegcy\nrezxczwcihbkywyq[sdzzflizzygfiovwyw]jhtiwvelkbaqhvnylca[xpnwnmqbaawlyqz]kftcwdejxaznztqsbhy\nzitlyztihmeogushh[wpsygveulmddxdzvwvt]auvwghiyvkvfxyzf[ccnkvkboczqbgcmekt]hkqnuaoeffocspxkck\nucliphnwkaxtwgnma[wxkbcziemdvopzeq]nwxnkykbefamsdo[lveynsoldnjkcdn]kluaaaoiqsepyqfz[bgjuhrlfjgiyngwkwgj]ofjimzheftgbbyrugn\nhshzrytllakuifsbuap[znsqxjzxbeewshkb]tdiohjkqimfsaijvmvf[wxvmhzzkjopfxhshsol]qgjutmxlputvudf[thwwxcavnensivbscm]dounftyvyaoguqzy\nhktpfbzotlbrgddcff[adqmcoiraqbphjpag]fxxdcjqhwkftprk[lfeudfsbvnqjvywynfl]whirlnojvbkpyndhyv[xpypetlsykaucaibapl]gcpogvgqrgensxdeyh\nafbiuqpasfjkniuw[bqclbergutdzfdqhdpm]gcgpimwjmvopfjhk[geztaacbsloyevwikqp]jjmlssrsuxmhbtnq\nojotaeydgumtjrfdtam[gpkjanckhqjvfjewt]zonzrwxnucpwtrmqyhv\nllkryzvclmpozerpao[gfrhlpemunmdackfmp]fbntrvdilgbposhu[koksbsqnmtfdsyifpp]eswrneaxvurkzfs[ixjekbpjqsrhnpgw]pppbdmxsdflptotr\nvbmibdiednxxbammtn[gqvlmbobpzpiuoda]agjiighkbopkxvwakva\nfnlgxejzkpocaonnloc[ojrecrvcmirtehjfcvi]mrafnbifqfcqxpmqdrb[obuqfqpyrkeinweynd]qceebfqvcmnowjanh[ejpkcpwkjfbvyjmyzoo]hhjyeulunsuagwq\nnubgjzyeuxvtwcc[vlpjhggsyeiulml]evysofvjmwxxazzr[tapuneqjkzgtblgy]gvbvijhcgtrdsybt[sdufwiyfojmptfruns]zqzvbotgmrcynfyq\nibcblmwnlhhftwfd[ajuhvgkyaqeikjgju]rvuwgrbnjxvbcgdpy\nhizeoqbkkesksvtjotj[wkvmcgctdzwhzlubt]aegcgfmdneprdbw\nlqyvebgqsrsfbcdccps[hygatrvziszspyihy]ratonoqinqfwcmm[pfieelpgzrfzhdffhx]zwaytmidpntpolajcg\nadmawesoilkvcfx[rqurmchqtkuifxm]tliyyitqauzegwst[zwpbngnlemkipcku]hpxfncvznjgfglvugk[ruinbrosnwmxdzav]adbvgjbxedbmxbkpxa\ngpqgezsbrdmqmeihdr[etboranxahpniwzr]woeyirnlebizohoa[rufjzeicrsxgitspt]gltoxcqgcsnvlys[dcvxqvoivyuxxayd]zkxlasittnitmoisr\nacoxthwyfwbhszfoz[wphyzlksmfenksfs]hpzmfaofkobjpcdxzs[sncrftlydahuqmuvoqq]ojvuhabayhrsynq\nnxtmkatkddomlbnxs[qdqxrwoaamrztvkzq]ycyqxxaijhrpzamcbh[japizeqvlqsmdqygr]xhxvgqmbzgomhsm[kizldaqvytagvviondv]tidqihojfrzvyxy\nlllcbzykxbdewnyff[iomemkjmyaqllvcx]vjvnigrbpnhdrbi[ukmffsdgnyqxafwstg]ralpevvmfxtqbzyii\nvphviazdmmvtcyc[dcomcirqycymvqkm]meeikjmqliqraeqd\njcgueeliyoclqera[verzkovhghnquyndr]lptflbxptsugmbhvf\nrcdghcuautflhme[zngtjffrvagsmdrxurj]mwsuxjbytlzyhinxyr[cibaxfqjdkmdwxr]yikrelnmbneqrsg\njyvaeqjealrbvbvekn[yharteswtwefyedz]wosalojtbxzaujpiba\ncdfzjfycznejinx[uhnuxxhxgipoujnarw]bkwbisknvmurfnhp[jwbnvuvlvegrddzf]bkeykrhmjuphuvoza\naalmyxywwvbwwttad[daxeeneiiiupzvqz]cqcjxzindssjrqb[komptxyxwgtnuedefro]xfbjflfujclbqflke[fpatdmophhvpcmwfj]cqbuduaifbuhwiy\nkogkhuakigjclxbjoi[yuidmmdeopwzvatxc]qdsbzscrwpmnloga[xsnwctwrdpgqvggoian]yayspjjhhpdsyzkkzx[qbttlvpkbplhagtb]ndnljzkxhgdvclz\nrojijwgcylsaspmmrdy[jzptmasniljjjusl]fslcazgojebnrrrz[ybcsqnloovizrxiwal]ghjlkcnvkjjlqodusp\negzqbmomtlqvjfo[cdarustihbcqwpfpcv]fzxqpzavyniyjbfvc[wkmiofpbdcsnbtj]kmtvlxnlvdjflivtuge[jvlzovzdpwxwbcak]hwbtpuolbupvwfcbh\ndrzhzwluzurvcjogd[haakukjmwslumvgq]cmwkhsuahrqxfae[kugdxfrtkjmyyfheze]dyxxyffqsfctugyca\nmlalvviidgseekfkqtk[rmltlzesxldtmsnyn]xdqfkftanryqfqrqkhc\nvkajuyjjhekfhmwwek[uuanfibpmdbwxesfmsk]dxpsqnnmrnspifpcyts[ezmjkdjacskqhhbaupr]wkzxoqszqigbajudnq\nwmpzatzujoibyjdle[awbuzjartnsdxfqtlh]votzdrynubyfrdip\ntstuekiwimhtizzlky[trscvkeiiriseqj]glbwxwiwdqhndmnku\nkjgjcnoipwnlqnk[hpukxdqokakrgjgjpk]nvinvznddzuhupepemb\nvuawkeimjefqtywj[mgdvjppiouqnnyhzz]eeemepklcxhhfot[ktiuxquqhzrojqo]zcwlowvczfjucqeo\nzatolywcfoplujidaz[avcmpullpablbdhusiu]bkwehsbzcysrauzz[tbgkmrwkzqfysfdh]anakunhzskapvmq[cqzomvulpzbizfuqug]untygoozordiywrnkm\nozynyagffvaeava[lvsgzdvrtdifdoxgvwy]pdkwomqrhfolkmj[fhemhaolmihgxlehn]huscypjzuujagfaqk[deqkgecbrdfhskujqg]grknbktwdyznqgrwm\nmywakayudrxzofpri[qlywfoydoqmsmaoygp]xpwmtcqqfqsmsys\nsdwltsgbumfnbqq[irstsqsogmppmlmkont]lrwnbdnpkxgfhjeo[eqstbbwumfepxoqaszs]fdrrfpfiotaugunbdrr\nbappxujhicaqxhwiaoo[bjvhcmhrnldlwyrf]jdxfokaxlkbifuwyv\njlziyvwcuubpsziikv[mvkolefxtgoarsk]tpixifdoybzfwnwle[lpbkitwthyxdbvwflp]eyuzdxvhuukuiaqfp[xcwvlmoqpjnehwudh]sqxbifjmrgwknsno\nrblicwlpfezecfhati[aqqhagfhathupym]vspyjiyytesirim[rqjyqiviftryoyychs]voksponpgjfuwsp[tmsccufpnvjdtgs]llptwgpugyjizqfch\nadmwljcwmrudrrph[rcxxxswmdlllfdwrk]etyjbtmryjxeajzccmq[nivhwmfzjwaspuon]tslmnzikhnbtqwkf[xnwykihihgkletgdy]mrtryzmlleorzwpi\nibgqtdglmjgcdfsycxt[ruddaxuheyvamwyi]neoneshgxmsbpydg[ytpshrjgditzqmjdlz]nlvhgtzsbzoskiva[asuilfpsgtgyftgtsho]xgoevzdtjemapbnady\nappgubyezsrmwec[wbqyvobthbuperojt]gqxsjlchxpwvdfvdf[xlndklktmbpjkzuo]molwavhkvungdkvwywm\njusgjqhnjemncvbvy[voitjezdotclvwaggg]ffunuypbjmopbbvoh[lhufstqbkhqxqiworpi]gnhhneydiasvmbvbga\nhvboappbxdqyjvxqyd[yukgymhpumetulsznf]hgiqjmlrezzsfndrx\njkovbtabgnbztjmzsoa[flxcmdoflhlgvaio]qjxscacvdykhkxclej[taocvcbcyfrjgcxlkm]aovpiymrcdmebktxwfa[coviwkpdmukcsixdob]trjjdhlgwwkwtegkqmp\nibnaxwwqjgtgxnlax[zozdkkwbccwdbvbpf]dwuzbcgeqfepczlvwo[pmlmuysuwyudzjam]pvhpqtcigtknoqxlib[kvwfykhxumzltcxidt]hybnroedkguawhgl\nxqwhbiiflggraco[uwhisdtpaprjfji]dexzbtghefojvtt[nlhtexyhufqeneytdtu]fpskbqhfhavnbkjxwn[gtxmsoydrotriljoov]labmxjlalzgybpdjm\nibxakiwqconeyudxj[mwzjwhmnlaobsdy]gvxbmnzqbrzuorla[dvbreuhggwgdtbjet]hjrvpdrakncsfejis[tstdqmetsguihzdws]ukllrzriimevvsekrkv\nztiyqybtvliidsq[mvhqxpqunpsqouvgrbx]qmhkzbqhemycwxeq[cdadaodqyhjhelanr]rtrnroumhiwdadrbe\nnswbgqjuxdygjrihvn[mkznbbryojdlhwee]kccwymwlzrsilyn\nsebujequsxstufe[romzdeirdhctzkmemwt]vqcobpsqzelktljh[twewiabushguyyp]mktiojirfewuoacey[tgnliawsrpkhyko]kaytwdodmxqandynomu\nqvfoyofzmhctntofr[xcokguepiaisrpwewng]lwwzyewekuamxxlepz[vybjmfsierveheb]bzvvxsdlcohnpmgir\ntxjecoixmxyskgactb[tvgiyxcbgzkdmgb]yvjfganhyoguuygau[vztmvqrrheqkzasss]mngxndysymgybqw\nptprazbzxzrjpnrcbko[qtdvwjwftefqzaw]ajavbdsfdjghhismds[vvouytxwsxpkttqr]kobwalobjsrwmxz\nucvupuxupiasbzxsuo[hnocitmtlqgttgdr]qghjdvyrttaklumszdi[oyeqkgycqizvaok]xpnaaapzbfqdzvcqhr\nvvjibkoyadzluivaen[cesqlbhxmigdxphcr]ztmuzxnzeprichmdsc[daemwvspbbljrfc]jmqbyfpmjcddlepf\nztncnhqvomvfnkhca[ohbigcgrevrnpvuwgpv]lnjucgcpghvtzlrgkh\nnsdamwafqwcjnslx[upwtncktpxkvkyhd]smtcegxuoakvjrl[dhvmeqrfgnbwqtd]zwlvwesmxdcnywjdb[whrrgcaujehwqcf]ayjiiktvzvxxquszmh\nvnqareestxydfvuvj[psgzifyszldodtw]zkrympmklegtsstov[gblinnqlnfqargqx]hfcchypjbzvbleabbo[xvlxasumenqxcdgzqo]zyhgaickhrgscmo\njqaahcqcjjtinevp[kkntdvvdghnkloliin]zmrsdzabbeotokuz\nvnrmthshyygudsrbu[yjvauysxhjhnmqenmkd]jbjlrunbjbzvilmyqf[gnoejrqddyzsdixecs]qipibwxkrnbmdgtevfx\nuoqovspbksjvndhjz[gntlvpnmkbjcbsesyk]thzecqozlhmhrpm[ebvhbuhvuyfudyeyeey]zdlhgafvupyipekqoqt\nhwilsmnzpcjvpyor[pmphksrtsuqgkdqfyx]psibvhgullieqqwyd[uqesmzorfwbvwgkiu]hlxqjuuflhxlgrub\ndzxxmdpesgrpwhw[ohdfatbpppptmdyia]pqxvivkjxrisnmzbrl[iilqjrtayjrvxccs]gwfohsvsvsldpwaelep\nvaenounqqmpnzww[duovdncntfceyoqojlv]qttmppevxurnlzde[jhwuqoqwdxjwilrgxil]ehuvfpawjlrzmssbzkm\nwwxcidipvnqzxsvhaxw[oivkplzzdeoyqlemho]qthsqnpnbraqqkeyvk[pdkqargzfikxoxwsimn]biqpfsweppknwjvuwx\nyefdguujlfuicqqiq[hqlabsggdampkda]tccxpvlmetflxhnd[oqnlgkzvzbhvnzzwz]rfugmbtihisgdklb\ncmapvofvmxpioycw[wsmfasgncvdkvjnodyr]dkxkldjxlpdineg[omntdlldszepbdcynah]swcjxnbotrewahi\nawbucpjznymkfhjaa[avrrlftouhjbnle]atvuoxpckhvplxm\nwfrfilbmvnfdjycnlsf[thxhuqnznohekfern]ndjiygqshnkfehr[jpdgoiqcdevzyrywcp]iuqxgoskimjzasbvsct\ncrckwgzymgpzhckbgct[euhwrvuqcknwnfwokiu]muiqtteekeqzajvnuc\ntljyrckyrcnheftu[xshakjmkjvzulic]mrloxmdpqnxcjhnwh[yyqdzldmfgsnmph]lwlpnskgxbkivqku[bwyxcdoyizqjmfvmc]reyetuasijwucrgylh\nzkisfuqufwbhfklf[nicopfmlcpsvwfq]nmwkhlxmquqelszgbe\ncqnuuhyddzalcxc[fjmqzkljrqjbexcxxf]pbjsvyixepnkthndhb[xztvuzlknucygyvegxp]nwxzswdvaspdufotcxs[bivsecxgawosnflmfd]bvdtxxionieorvecr\ntxqpvnrfxykothvao[uikgxsmnyxwlobod]tddprkiwjtdcwbobzrn\nqjgftnxktteviik[hsnjrychdzepxamtfop]golzdtnptijzmpo[gfgevfrczlektwaohmu]vauncttcwnozkrwc[ljvbawzsqbknkuktnn]inwckpvsipmunmpo\nkqxvmryochlslekzhl[ivuyfsoefnqqtwspxtu]bytaafalzlqvjumuleu[apezlzoaspstxvknv]mnkfbppakmectmiafs\nvungsqgzakhfjlbuwig[cgydynonrrgfswomgev]lkyqpvlplfsmznc[kttzkoqpeplpfaoheek]ssijcynyhenhnwvd[hleabsbwqkqqnvdd]xbbxdphvgzmnauj\nrxweekbgidxrpbcxk[zvguddibzffxqcmvq]edhnueezmvxinaxyo[mqhjuhujxklirvkm]eaozfcadmhsyfpoj\nrcdwnquofraczluzh[gvtnjtocgohcsiswush]gnajmbxnrzppwobfjta[dckvvzvigupevbt]veqtchjayfclaltohjl[mkwsfnvdltripnzdkwr]jhdwksbflywaaul\niltlipfzwdrsmefm[brcprzzhfwsrzbk]dlegyxlpizwtlts[fcqadgpocjjnahyqm]htwrqtzfxoeamiqgeq[utrgqiasppoxrbhhv]hwkrxhaxxtltgbuvj\nljimkpaohzhoifdaiko[dkjxnandaghzxflymm]szzkmlubraphtnokpcj[irrxpfhtabogipufkev]bjucnqsbphjhekfvco[vejyxqrtfxuxeuelvmv]muygwodxspxrrijc\ninovovgduyohxdw[tbzvjivtssmlxyc]pimyxafhdeyomgeu\nivahljnswgwewyhhn[jvfdvgftpukjcny]rtisgwgamadavuw[lmwlmlrkckbundmzjvo]eqjgikocnpbjpdh[mdpfdbxenzwycoou]uelglssvxdcxlwucz\nzolsnrosfihzzhu[ravlcysbjoagcvaacmk]czfdqdbrlvweyyvbq\nvktqafvmirobwwhtr[iqvczcryidfihypuz]adgkyomqrwfucufmm[ecbtnwriqiiaurzkn]vtyotrwlidvraksywke\noagqrhpfnkdvvsqemp[qsjyvadkirmihtfezev]vuuantqauwqrbyzxpev[mpaqvjcfntbdcpdi]ghgstpggptgbvwnmyiz[hghmuvsvhqxvxmmnx]owoulisjbqpndzgt\nyyyrtktdrrprfdtbyli[tqbcxefwdtzllez]uaixdyuensmvobo\nrginebxdxtfoudqwqx[bvnzfxfxsztzqyyq]dfvdsghoihksjcoccbe\navmokgrhvdnoptv[ngynfydflwspxifoi]lcdqccyarzcasxrbue[navvkjotgujkewhrx]ogzqcdvefknpghfjssj\nsshuolwwobwchug[cwcurmfcxqblopvho]ghvtsqgltvvlsahwqpt[skxuphjregpzpqm]epmegfynfypbewftism[mwtakvgutsuppqz]tvapecuvnpedscjkfs\nvsqfdssjnhoineb[tmcwmioejrnbdyrq]hlclokouzhvmmywskkk\nzuxeupjvtrzzlwezm[gsptwvqfzpvkevapsvq]pvjuezgybonsblmmxdv\ndsyuvmvaisuqxff[vmguqxuvvtbjrrva]ivytyfdovrfmzudyzcw[kwgjymkeadjgvdvxarz]rpizkvgpobjriqutyt\nrpetcixepthhnydtsx[dvivlhhlgbxftlw]ensdqrwytpwniviwh[uierkmawdkijrbrbb]ywvqqtldiulgtft\niruarpzjrxupbdovqlk[cipcsklubepettbee]jfnvwjcgypepsbnauh[ncvfofkqfotujbat]moqzftmyjreztaugkij\nuqqijwordoicegmn[ihceutxbgzatiwhtd]hxqgbplciimactv\nkthovdomnavxzkrtg[utmtbhgqydotlxos]rtwopdppoocytum[ptdpdrndjiboffigipy]fwxyvpdnlhjofwjtwx\nvitzjdhxjjossygyje[vzysmvvgddhvkufqb]fhwstpatifhmyespsay[mrpnqgygncsiwial]cwbbaisjnqrpuzca[taqkhmlvfdelcrzbryp]kwsdxlkmoplziobgct\niwybfvkucobqwagtdf[nafgfydrpzzdujp]nzdzwcpazorvzncb[niuturhwvakdywurves]txickuysfxeaamhlv[kpiwhdphpimfnmjinua]crunehowomfdmznrc\nqololsmsdenfcxmtqxo[orjyxjutzakvhok]wgcgzavspuxtiyhdds\nfvzbruyrecjzobgjfnv[tfnighcrmbgeklgaq]eanwrgtehcxvxow[hrmkbicsuekiicxw]pmyfavysbfzttzncxbm\nfrjvccazhabvndxri[wrmbltymeeoqpqtx]hbyuxmlxfrjrzifpj\nnkasezsbfuldeolo[wshypstyfliqxplkh]nsoplkbnmiagngvusr[mwpwshlkyfrxlgcofiy]ycplnfgorpssaitngop[rtplyrqezwrwqhc]houlrclmoatskoufgti\ncmsmitcywtmhtimj[pevbzyuhvaqftnugc]rjaxtggjpjvayzmhx[pvfplwswzpusjzhom]jmaurmlkkbusduxd\ntshzomvzzouayvevgb[esegiphlwqwlkgt]letvbhxdhuzidevee[zngibooquknjqqxnxz]dtnugmifjztkwjpqd\nuuzovqhxwovqeki[ddwwgejprtbquodnj]nafunjrpotozufcf[lqyfeicklrejcwwrvxu]kfxgdnpvqdmvvitzt\nsyawdtcaspkeubwty[vyxykmhcofzktwfex]fmevgmpetmzurpou[bgqqdkgrojeesxj]lhnvraueoksvtjz\nhkyhsguxgsejarhub[kuluosrzpmogndwe]wzqvcpdculcwgqldxm[uybwzbsgzjqfspayk]nysymudwyxdocossgu[usnahkjspekuwvgtje]gtjxtcjsdvtzwmf\njiuygraiggbzoxz[wopmhgtzdwlkyzvfhs]kquojxccygvgujcopbq\nrmdqmtbvzoocsjddyj[mmwewpzkjayrxkortj]cznmpvsiqtjdpbgbbf[dfgdncqhajjrohr]kjsivnolfcccyijyd[smuudgbnrfqkxzec]zukmasqygzxrjqoz\nzvhafubtbxcnggnnec[khfuhiaikrpowmg]udtuciwamjspaojuks[wlzjqwtmrfrfxmxcfd]plaqjdorfrbkkppep[exrlzahsxksdqsllkn]fooqtqpmnglrwokq\nrilxjscompommcmc[qpdxzxqycqutfyj]xvoufpojhanaloymvez\ncrvrlgjjpprknkurjq[tuvlylfiibnpkzmi]ghncayxzzrrhwfe[atnpozkssbyznplv]elzhtwbiernezqns\nyvdbhamisqligavziqh[jcfjonwpgcszajk]xdszcpfvefvmlduoo[vqszbxqazfwgrfazh]geltrpsnlfyzzxjsg[usmmfawdtvkvkcm]wqimqpbsojuimmf\nfsgjpguxmrmwxeymhjr[gsunymylqpnrbmiqyi]bwqcxjzweyndcslvxx[rhtvuzqaxazgzhhwp]lqiceppxpscreytystv\nzdzsidcfertfbeifye[vdttvawxhnsjirsifn]abpddikgqtsqalilwl[mgqwvkdulrgdgni]bqjuliwrgnvycgnvcr\njrrmfvdpwdborgjxw[uqsuxsointqfsbunl]qosvmfqnyadjfhrc\nhuekbtocejhhjud[hzglqavqagcxaaksxp]afqncrfalluiiqzfo[mdgrvbtzxdzaztpeg]lsthchkkrvofbaa\nlsehhfmwrfuqzewvxkv[rjrryjrjwhgtdifux]nnhqgwmoxdcixsna[wgburhmplkpkrgmpco]hrakazqqsstcrxupvv[mhacbkzqgskhorwf]fbobhetgehykvsbmb\ncjmaltrbirusgyoirp[eipxzkuhukkdcdh]iqyymukrkwitywb[dcvtitgqvetxqip]sldydwlrcdcrljhzu\noqpgfzdkcrsrazei[geqerlvxxatddmn]igakhcntksmsttyqsv\ntjhfyftjaclsdwzby[oiinbkqwzmhzxeic]ehyliwwisegufbhh[sqmpgxuqhsxnzdi]whwxlqgetakchwht\nukgmtuvowisscvp[nhzgobykdniheamz]ekflzosxwmggiuuudz\nsqbsxlbyunhhepfx[okuhhqbyojpkahiz]hhywggdmcojawfpvkhx\nxlqohzjcztxennv[cnbtlwijpkczgrk]pwxkxivbtxzovdn[bekntreckjtfkrsihm]ouowyjrzyjbgsygj[cbirdomndbelavpb]ujdrausbmqhnretkhtw\njaowfyulkleymkdpl[yxwftdgbtfzugqnnzwr]ztmzcodybfzmfrv[sttkedpckbjaxmqvhds]fidvanwfqvpywervo[jtludguqxuwucvzcjmv]mfnoqzvgatqhvteacyp\ntxyjtniwndqckudby[jbemysikizywlxbv]bezhcvssxmbmzgpo\ngcxfeqprbvpwtdnrxcx[kvhziidtwrxlhejxm]kxzumooacujxvuwsiui\nvvzhcfuecgfvrxrnquo[oqgutuxthxlcxhpke]liqjotlxzbmsassyxrf[colshvmiwbfjansdg]vggdkkyqrjvthtvp[dmozaqtceghrabasafj]lnsoewepnlbqvibyk\nkeehyqsqydfzlqrqqu[obaslijmtiakxkc]wmrxgysajmjymaqpas[tqwlwdqldidsapjtzct]mjeqlhemnwupulj[xdnkrxbbtlkzeapnat]btxcxfncwhdqlhmh\nqwdiosimjitfulva[dhnypfmjunifrhopd]plrzlaakgfirzcccif[strfuwthjgfazeoq]lvhimnjpbpagrozczhn\nadqktintsuslnns[mtlbicyrgqgnxuhqcd]mdadfpkvbkvkaimvghc[cvqgxjplvvqbato]lbskgsbvqnvndequq\nbrftuxdhebezivqio[yukrabpvgetpxpylxj]ldgifnehggvkdtq[pobhasghdmctwcgl]ccevtzwnziffjhqu\nibeocesspzaammu[twfeunwtyqohdtz]kiknftbdbkwrzhrdj[ywsjzyncsuyykqgu]yqbjeqoftsblixeozlz[mmcmncavhecsxbxi]aumsmhzrbxpjqrxllit\nhieqiicvqswviniteuv[ubxwceioqqhagxybrl]kikxmdnftjiqazj[oyvdrxwqbljzkjbh]mejsqgnksglqmsfrlf\nzjeouhblfsglaxzz[efenlnptrfbopulk]tbdiezqxnkiwmifiyy[pylvblxazwozkdv]guaxwfuktjlovasatlc[blnlcbxxlcgddfquwgx]jkemembgzzxssliiywp\njuscmzarbykdkbcf[naosptvhazhfydzz]yflhbtlxgowuvmf[bdmledxprwnfcaflpf]fvjeubkojokjcfnzoo[bmmclnpuykellsdywvh]vibjnjgmtpoyvdw\nkqmrdsifaonqprpach[chzxtugxvhbjujlzgq]ffbjsynmytyajcbsyn[jsondannallzwhz]gjrnybnhyxjismip[nocashryyqnbsszebpp]pbugutcxooiznkwwim\nvfziparbxeibtccl[efwcwvbtlutmoltmrr]fjwkgsaambdhwvefs[nsrvprujruqdlxrls]ivmnrtvdbkumpiio\nbjweouryhlzxnkfj[uuqptwyhasahjmkirh]rrxwiqmpcbwkhzr\nbgdivzqqpztnswtd[xwfurbswsweduce]osimciokvwbydgqojkk[yyjvptlwdknyxnzpr]cqiztxdhugywyclvz\nftcvabkblehqjyqtl[txwnhqhrsrnengcl]skhszkrtpljsgiylab\nackokzybncuxpku[xzpocuamnohjypcdq]dwroulahreyhkraojf\nhqlijbwudkycvijqs[buaclznmftiadyidde]jxhkyqsoqbpxcjgsus[atcehpnpgwuchfzekk]rvyzujpclugrfyksmk\nhnrkcioqaeeqjrpg[cowbmmovdcsubwiltd]myuwiosvtmymgfyav[yvyjgtogmgxxnawpda]saqmtvyakacfwsvtxvd\ntyanupyqajrxmuk[bkxkehodeqxpclfebq]kiupgpdlxfvzydgs[rvbbrqbdsolzrgse]srmrovuaxvxvzmrmev\npjbnyjsxcwyhjzpvqkl[qtgofokbciwsszwa]bwvnbcneuvipqaaiyjv\necxbamdgtlfpmqhi[khvmvwiorzygnitsbb]znripfwspcqgsdzosv[nfhgdavrprmveeexppv]uhzugtmfmipmaznbby\njdoggfnexvkxovwiatd[xzxovisxynejpyxhfz]ciehyiyumbbwwxrc[nozxzgzvotunvgnhhjk]umzgdkvcwauvkzr\nqhdaymaijahfkqzw[mbjhxuvbksqtvxwveau]rkvgvfqsehbynbom[keygsbhockgurps]nzmhlxxwjlpjhzbhw[ujitcxihwbjrmrep]cbfpxvdzbljvbfpzsw\nwiuprpjfojcowmy[vmrpruwhtzbwyciid]ntbkrodejcrwavjfqfa\nctqdkuxwiricymu[wexourbkgedaqbybfj]revrxjgaoalievfbj[qtvcolrhwgqtjesuvkw]ozphhuwwzzguldf\nbqpwrkyhlysqvwxga[ghyqnatqnccegjnkgw]pdgglsmagwkwemidd[fcddsukcrksifkv]cyutddgeoqcyopmm\nmxmpasrqdexjpqfapbh[rqeoslcvcwqteki]zpervmncbpfbhwaxmd[rnljbhhtgiyluaaetx]aycxgjfqyxhgeraelo[fukyvtlgjzupjjrxvt]peumsiryqvhwcsutrj\nnbdnniplhgrqkrcd[thcyuekybfqraxspek]rlwhyqiavfrfglg[luswlglyiuklvbuqe]mdgjepgjbhuyqkcs\nlwueejoqpguiciw[kpbyblloubmxdhk]omjurxlkfpsdwdmbl[qnifmaxwapfvglrt]vssmqdzlxyyrdgkwh[ljslsxolkkivoakh]upwkosogsrzzuej\nrfqbvdzxrnrbuhvw[wzurtnrnslhoqkdoaja]vuxsxofemkrjzqkk\npqslistydhvgulggwbi[nipdejpoxqfmbeft]frepgyumygqywwycjl\nexcgzlqtguboybi[guywktnzbmkwqrbp]qghuyihqlgjrdbuljs[zrkzhirafcadgqnifuz]medyulldvxdtpmqifpg[lsmokycxcicnxcyfpe]cobezkjtvpuqyqu\naajcheqlcfjvktswy[lsgbzwuxqcbgicd]skvwyyeawvlzzfp\nafnnxrxdhbqqixcli[msrrsiakxynnwiard]tzanbapzvxtabeuz[rbyqhswrxrofedlykg]phyilynmscckkxgbhks[enrqxrwqiotksdor]phnmohcaqxspqhv\npjyiwunebggfgpgsk[ovrxnqwfhtrjoxwi]lmkquysxzdebvarwfxu\ncdztgjverhjafgemi[aogtmpdwqhazrij]dmypauxszajopbp[sdsrejzmjvpjijq]okitpugefdhpbfnzs[jyospqqhusxbhfuuzp]btfwfpiblknocxncj\ndjgkwjxzxrgsncwd[iuaqmffmnfklkieaq]agtkftischmbszqpo[conozrxbpdsuonpvx]mflbagusvgzybhasrlf[ntidmtstsedfdbfwost]igffrxgipzxzzyjy\nahfhhpqofpjyshcus[lrxchnknzrjtzkgt]hvtqhnuzihgxovj[wbnqnjjnzltdyvxswv]bmppxzhzgwdsckuo\nghwlmylxxuybkpmo[bkxcurwihedpwjm]ypkvoiavnzgzlkahlp[lnxohqbghwsnbeqgk]vsegowbzcrqwcsgy\nwhzaoswycajecyuw[nwzgcizbidljdtoull]zfyczyjiqsqxgzsjm[nfkpyfcjwjijtnb]dabgzqajwpzsczrfzrl\nsitsnxvhgjjnlitqs[vvlbonwoskugqxo]bqitwdmlvnlcziltj\navgdblmcidneynp[gkjdefhfakqungkij]eztuncfdkicjhaytdzw[dcfldbgzscsumjox]okqkplzsscszdsxejso[yihmpxvcbnsofchozr]easrxwgppwzqern\ncvefvhycaorfsfbmi[fkvzdrremrlrvdl]cfcjirtcmdphvfircx\nwegfumofnzigbnhy[oqkrudppjpvcuvr]fzyxsxrktwkgrvyiwz[jkporwybtotanposc]exmwkvygccdurwge\niqfavtweexjxhdkz[drnsnxjziacormb]yftyjvtetmuvwew[vlrdviggcdfnribze]xzykwuzopkedwfqjxo[vnadxonxshmwhvk]mqbtnfjmhjmfdftwm\nodyopnscztauzvjvbfe[zpgqzgzcqclarhkkc]lfuvvhwhtlypbfv\nogaqzpgfwlmdrjgo[abvqsomptscdejeyfg]rukgbtpqwyyvnvrdz[bcvgngjhgitweuc]bljvftlzomvgvmlkzsd[yhpnqsmblsnfgfnyv]nvnkvwwllyygxcdnef\njlbnwewczmvtoshkwk[rmtpjyqhqxturbfc]ulsjqpziwqfjccmdpgy[neunvaltjjkcxvf]opuswwcrtqbkqyq[wzpxgeaohprbhvamaf]ybxisfhszawrtgsj\nmmrbaaqjvgpshmn[exjdqzgpzdalrwmtha]qrxggoccbehivaiegs[udbyzlbkpvwfkaot]vfbmvytjziptkyv\npjtbkayljttjwyztu[clbiouysqsjbyjguhe]srltvgtetxcbkud[qnuhjnuziihtvqtbeyw]iccppmvrkzyehgiv[lldvqxdqvpcrizue]vpwqjhbktcmiyed\nvxqpmalvgeaxtkpv[elquojhkjsxpmks]dqvuljielvjopjcuvsx[yoklegkajhhpatv]cnfivppgdnkjzmrr[vnjebiwfefjgqzle]aqkvijxvgljbxmm\nlhkkzniihzzsqxdr[gvhbztmgmlicdoasdxn]fthfehxdcnyjhdwvsx\nsthxexgjpexecjzr[semwlxfagpybhblcq]ztkmocjbxsqnwfs\ntsswuaezqpzyevei[nolctgupccscwsj]serolamcjmqaawea[qgjyyldemhsqivwmvtn]rlmxvchrccptrgmmbko[qtiqgvilvevjvlkxc]jjcnzdjdxycczflslq\ngeiglvdxwpsdtyt[isbkywwxvuzljpnv]djxvppprsgjagqtfgl[wmhnkumvdpikdjhmt]snjqvydpmjqutduh\nksqeegpqcodzekvp[htprcliyvqdgjbqv]sqykqimpyqiwktnq[bfjsisougvnyjoyha]ixghemgcvicbedylz\nmwomvddjcxrdzmqplow[fznhevtpwhldwpo]ygskvziyhzxmtbcikbl[tjhieqjuukoqmixm]mgzzrsccohxzfgak\nxvdiafigrvgrckwol[gttxgvtlreruvonzl]fgwyzafvtwaqdwuo\nsiyvzqpzfobnlgtxn[zcgxyzgysabhpvsviup]xfdpicxyxyjgxyxd\ntuyintcsfdyhfxofk[abiuiwquiscebxbk]zqazrpoxqqswycjwvk[hayvaaykkacbakpom]bwwhqzhuiitdaed\nckkmzdomnglfwcbeh[avqftwjqckajjqe]fkpgyrqzygfcheoctfy\nteuvnsaipkrkmuu[rtiypvevtipwuelkzxf]xqywsffobbokraw[oonkmkqovksdycu]noxwpblcqqbikpbck\nbwgmejgaihdorgcqq[djldztucejcjizv]nuuzvdhlgqscyrjmab[nwcglzehbfzzvgr]aybubdihvypmvqmpfhi\ngxrmeqpjnbegqjeuui[iqpcaqmpavyeeqkye]etydxarxyxculok\nwakuruxdmenhmcsgt[lndpybwsvzyibmd]tfabajlzuxwwhofz[msknqgraxzpzwytjx]lfoqigitqufmhfmgwgi\ngpusiwyruzmkoluea[ofbgogetujmjnqv]dzmarlipdqkgwdzwzd[uhsfvlrawossxvxyk]yeseypubhoapfgdjom\nrcmnwwzrimrifziyoyg[avrikteehxhxcqhsq]yklfcrtqwaxmoepr[lahpskzjdwrjonqg]wddynujhryzkunrokho[ixwzkdpcqefelgcoabt]arjhdevhgaqcohbut\nzkcxzfkwxxdtbumymqv[qgaztskshqiukhwuelq]wxzpzaxuhdtfbimub\nnlgurkzredyklilaicv[mtxzdczugdhoowtp]hnhcyeygqrbqdnsc\npbbcmecbydtmjigfn[giiambqbdgbgntq]zaaqvlpkysxuvbgbo\naqyxolkflikpaxr[iqrnhzdtynkqymz]rwmgahzmvwtfebyguxh\nkcxhmwgrvommccee[oqvsuahbhwioqeunkz]mhcyripmlfivqsimnpk[zptnyqihvavtlxkq]guacutltkqoixskg\nldpiuuwsszyidqxqj[tsmectapcwuyhhy]slauiehtpaocaeqyd[wbhrligadmsgznlyvd]nyvfiipvkthxjuoubc[zplkhqbtciuqnhjhiwy]olcmrcsayukgcbf\ntzcpkpyrdolcerqnwu[zqvhulfxfhgaehbwf]zaekvjegdligfrsh\nghellbvwbjaummjjoss[pevgyftbjzmlsryfzv]kjdgnwfofftlxbiabir\npidtrxbnvaobubqwah[nftxjicikdapqexh]mwssisitrwjgxhk[nghedqdzfdgxaqacas]hvehmhbxzfwylzdrjf[bisktoqalmaapoomzt]lwkkhvacvuqvmsv\nbdqjqlmohbjvqlson[mupepkeeoofwydse]ekylhrfsudqdcvkv[joofkljfkmpknazry]anyojhejtzfofcg[zcvpdeswtvtngyqleri]seqoyrfsqawkrudmg\nlmjegqfshvauxngz[ysmejumumaurgvgrsy]xrmslpnljfmaidojz[mtvwolafkcxlwjjthy]yjqsssxayanfdrel\nqmmiampdlsscnqml[ymselibefbqnqakirdw]uzxhisxyqljsdvhfe[jhjnivjgqdfyeqcea]nxbqpgyhtqzcwoptq[frlnwadwwyfnndeqv]qcbefaxmhgspalprcdo\ntavfmtbizkrpnerc[kmenfsatjafincrwrlk]pbbxvydrsqnfyap\nhwrkfzaovfbmrqhff[qglmybgnoytlkma]ibbbvmtqegqqxdk[gquqtiaqekcwiudebb]ozhpyabnxipgwfs[xqcajsdxhwpkofa]ssaordrnwjyvmcmjtp\npkyhiseqcvejtkbqcgf[xvgqerenvyizecof]sflyqnazxuwbyexzwyq[zppuknfnnngpwihe]hacwithomkpaveqjrs[whsspxqxxqihxrmqxvn]ifsktqmduowpuhck\nxqctscaefqpvqcrm[rqbjdsxwoynqeoubwz]zycfrxbkijaedhkr[rzzbvjmogwxgcqa]hpzjokedwwmsbcrggmd\nhcbohuwdyeacvgmbmea[mmpvzmjiryorskh]tydknyaqhgcxafmqj[ejadhaojfjlsfxs]duohhgjdfjffvwzcgel\nltlddqcbkkayshw[qdedbdppzuqdhfaxt]doedeeehsibaylpsnk\nbywykrbttmmpyacsoo[ghicjobuumyckupnmw]wzxuueyajmgprxe\ngejngdvsephfgyawm[eahzdehzhyymhcwx]qejrbkjhhplzgbehwdw\nhobcaacuxkoxnutlayu[yvsylobmhtczpxdhvh]qpwhgyojuomiubmahcd[pmspsmyxaqrdvcpwnwj]ghdvfbhifxhphkseh[ntyabnyuoadseevhvpf]opibtuiwjogylqzt\nbbuecmhireivvxmtw[kkvuwrudhmpqpmqr]cqrzfeasrpqapvtjqnz\nuxsiwqfamsnemtcqyym[wemijyiqgxbcsvdz]tdhlutowbxpxrkrlpx\ntnnlwlvfrrluuxjnvx[fgijrjghghgrkfmfb]lslknlacvseuzwy[acexgqeksduhjpf]enxevtqjetnyftgrad\nwiegevfedudnajr[uryivbxbutbhfuh]zrpurmrupgeggdyc[tfykavyeulosotky]ahsieiakxnitxhaa\ncdymukpgwzamxpe[ihvwjlomeozhnxq]zqlglkiyekzhkesoyui[dqdkxlczjrxgbdfqf]pdipsbuxwhibjytdb[ngoqkjeboqlsuic]efcostvlclbxvzhloan\nuuavzipkjlcgutoxrbc[orpbrqapdzdsagy]hbgwsmgmyowonxftjl[wrimpmzmwyjjtnkaf]qmlpvrkqhqbdswyyvpf[lpjhsulqumdzgjxuajn]yocpoqqrpuquduay\nwivyimuplkhmmkxioub[vqfixqklclmrbume]trenzswrpqljwctfat[ulkqyvjjpchvkpd]mvlwfrclcfqziho[pbmrqudqsivfemt]osmrlwtwstidtwmbmzc\nowpgvzzedsxwjjdeuz[kyqifdbwfxcphnb]kyeaxxmsplabrbd[gayquqvysxjwpckzlvj]tiuxhodkebirvmdb[zhnicexwwcgbbnfd]hcxwgyjpphxocggfl\nvrjvymyzflpaqfy[fokfgiaiyyzruyt]yvfrfomlsjqkvtps[mprfrwzeokyjmdetnl]znjipokvzxljjgqaw\nopczfzhpovblsevqcx[twcavjnyjerbqfqvooy]tmyyybovoyqcygzzyk\ngpifunuvcpqjornc[wcenyqazsxzksun]dijyypqoxxmjiyi[kdzvguquhohgsghqqko]tzknqsgldnnbotqnocj\nxtnewbseisluqott[ukktnadfrptzmvmnmwe]nfevmvifmaaubdrytcb\nuvwgvqvzikkvvaltpbs[darnokckfpuiwvaq]qjgglscrdhximnfg[cplqfytiupsnlwjnz]tjjkzojxijhhghoo\nmwvyjvnzfbptvndlui[dvpxdnwzdssddngva]nkvlbcdcwjumrqmjuw[xgrpriwhdpyxvakfpsu]jzugamflkelhfrzswca[hvdnwrkyrvcdkep]kqyiaalprdowzeudqvt\nzahhurbvayisuhkxluc[dpkhtfqcplnlwkr]moobahksmsqtmxasrw[oyxemzzmvwvxrldebja]tqnquzqoslugwcqcwtr[vibjzqdbmsmtxckkkn]ylujuamatwbexgo\nffpiprpoymeaccwoun[avnvjzwvzowgthwymt]sakvpfnqtnzdyhodzud[egijncssvgvsofu]dplbxmzfihrpopurlvn[knjefyormeaeoni]ubcbldkemxgefbnjcbj\nfpyokxpcrydmqzkgr[gprmekopimtigwz]fobjyaxokhstzjsgkw[njzhtjqrhoynlzpiw]svrqxlhgpckwoat\nsrrcdyevzyzhxnx[bbojuevgatiabjudws]zoxxvzrngllhtrtfm[rxoiyzmzwoenbodp]keodzdiobtdfgrxzgye[akofrgfwqtqblvntv]rfyrjcwbfblulkw\nkxuswiaijpaejqzoxes[cgyhiwbpjrhaacwe]uqqocaxbsotoaei[runskhbiegmjwfyjv]qgnmhdcjcbgbsztap\nkvzutkvgsyiyrab[zhbqkvgbyqzgwvfpbf]nhtaiwzmvrssvxsrdz\ntncgsbkllaugseepp[axryamrptnzekcb]xcvqkfuggjcfqhb[mtmzyjnvrgyuwtev]xziofjwvnbsothqzdm\nhmjthvqdelrmghgnvxg[cvfmsllxyxchaglntl]ikpeldmfhjdtnvaw\nsdhirfhdcxlwhxevbv[rfktrkotbfwiolxd]bhbkmmbdisqlclttbi[ueaqlmpvdaoxhezzg]baphbkfivkwpmtj\ncrzkarxgbgpitxjeunw[xlonohiojoepwnuhd]kalfjqpazwmwruq[erssxjpfzosbcta]exvgtqljewfuwioyq[syaeqtgrgswbgbetkzw]ofnozzjtykajqcuc\nxdojuclultxptlxgci[nkmxgmiyhrrfgoshmeg]zqxcexaabvdjcaiarw\nrewjiwxykozqjzneh[tczrbiawzwtndtqnew]yxrgwvnswgyxjvnot[khomcpuiavkhwjsl]ksqiuqyarwwibcssseg[dsrplcalbjojxlecjdo]falbpuscbjsdxvyn\ndusvvyynezzobcrt[yrikyxqxqreoqcyyq]vkjxvnlnmleqybmgt\nqzmjfdvoruomeilaejd[ksrwqvmnyiessfejo]lvhmckdfwzoxwmydxm[icmiecrnoqepcuzctl]unxwrfwxgnijdxqjc[tuwcbylgfhpaveyak]qslgbtviucbmeluf\ndjblesvduxlxfxp[grmuswjaheivlqvtst]yrqstsaryoqejwkd\nkpyoqmyglnrmxculu[tuyuqjronsgluls]whuymvpcdxvxrimvmow\nlruqeoicrisykqejy[ruqwiitwyrsithkyo]hbgqgiywqwsclcsn\npkpmmddfcezjrrs[rbzbxotrbqlnmlpidpu]aakddaqjvbbafbnk[sendmtepxbcpttn]udnifsqhogqvszi\nfoqjzmqhghzmymeq[isvvkjfpmvmhquoidkk]tskrbirqdtjpxolwzw\npneojhviynihvnv[meuldylhohlfwsxp]nmdwxhxuexorktj\ngpnxdnxmueucaawmctx[ggcizpwllvbffytwv]riqcitchmdekosocp\nkcoafhejmqsopizo[lyoqftddzxuuerafco]zrvrzbmnzcawaydwg[bhnmhrnwpzmghrprzzw]qcrnkmyfcdoymceacg\nchcabwcrpxqnelguile[ckxfqhnrwlulnfgxjb]toauhcbsxmeirtlyy[cfgmasaieapbabcgdd]ijenfrqiaeiehllwpvk[ciymykejvkzxsbxy]iiyypzaxohmykgbzej\nyeqhlpncjcipsmtzpi[zoidbyeatjrlgmi]rcrhombxichyykncbwh[wtduqjwbefekhnwo]kqemsisbcrcjaqzdzw\nnbxvvetblqcarlcku[njrccfhdvxtarpj]rhndgwlyfzaeubc[imtcezhovdlfyixzwm]dwughoowqyazwaziea[slarywwdukqwygnhre]efzdruetqfoqqxusb\nvhvbnbyluqqaqzolkrs[fbfwkawbihbzwlrhd]npfzyqkoxlgkklgxz[zboinxtlzrqbwcqo]jqhvalbjqaogtyn[razwnxfkshezamemtr]nywqcxpvmuudyqo\njubvozjfmykufhrkk[qhbaxcvcpyzbrwjlrij]itseilbvjwvzlgqjfe[lgxynowzlpqgoyrk]inolsbnzxvdmvbrvwqu[hjzfopqwsuqvqhb]wffwgmhjubihiqkpuls\nrqnjadbwfosviivshb[rutsuesebrktxitgy]abukeyordcrrqvrgf\nbfveiveawwoqyluxwu[trxwkfvioqzltgafma]swkyqokgtrprzzit[kuziuekaorgdgqjgi]zudaehzrjfzogiwb[fyxwwswqrbwgomriqo]sqfjrdskmdvalkhchc\npnrvpotetwyvodue[xwkxyzxflrvxdfogk]kamxypekoelgwktq\netjkovmlbwryvhv[wvubzziqtxbjvua]hmrqokvqrctugqdazz[ykobpstcxdqweotsi]eiczvmdcfjpvhdyfnci[eeklndzunbzipcqubp]tjsktxuorvbnisy\nfnexznsqqbhygrm[jgnmivchcvxgssjcm]klqcaszkwyzzecve\npdmzjundpcsxbgplk[lbdsyrmgxnatuwk]nwrhpgieqrtzpktaiqw[dcxtjtkzvlxpibanjma]djszxtofdcuyfpdr[kzblikjgqfiaykr]yhiqqurlkwlrrjo\nbwtgmmjbtisnzbnyedf[iniovvuewpetwsg]dgvjyrzfrqcozekvp[xsulvxvvtwcxuvbxau]vvjyodjlbbjxigdxvxv\njcanelvhybigzhplc[lhgjkwbpdlcybzgacya]uwisdadjoniyerw[kzcrorifvylivkhs]ssicvecwpkxbdwq\ntuxlnjuyudvhazlxdf[oknheznyzffrtcb]joozaraxuivijskxblf\nrvfdfyaemhgyeynw[hmmkdfdhadrqkxzzmsj]ugfozgghllznjhdxw[ucrgusuuqthlgxx]ipiercifxtkghbkf\njgzrilirvzcocaphnz[gyrvhettmmhxaxbmyg]ecpwkoozcgtpoac[iretjtqyscaqfqziu]wqjckfkbfoqmmjkuhqe\npswuxyynrpckrquj[wfbedboaabsgnnzzzwl]wgfrecpfkvlvjzl\nzkcihebtrfmiryqkd[ybedpynfafkkrbfdm]ovrsmnhexyqblafad\npbkoczqfumwdpfu[gtcvqjuwknlrfxre]crpyxhawudbilybaomf\npnagrmxhmjftwltxh[aqlhxdwuzrvnwjwl]xhmgrrajywnizazyrdc[hxdxewvthhrwhsva]ckluhnyewiiqazzmvd\namjksgqzgmoavvxtov[ekqixufaaepczzusfga]fvlmiilpsqsgfgg[gzcyehzgpujyquhrkm]caaocajhmhqzbacvpog\nhitezskizncharbzyz[nbwuldsjxkjezjq]monndtwsxuikupvi[iardznrxkorquvyvwlk]etzyolkxhyqsdirbaj\nocsxlxpsgimcvori[gawgkxlilqzeakhzds]bodnyayaioozoeg[bmaukrfdlswrnvuwy]nafolaiqfeendahms\nkseklqtakbkzzhfd[ghivxwcqlgfgxeot]levjimgmcfpgqrjjic[ixwevpbqkyzthafyj]azdxqlromttwteeqep[kxyiyoxyhvgqlmvscwz]zxdujwvngqyoabmrio\nelgbshsnykhiyndouao[nhumkawagmrztsamd]fwqupmyuogneywsyhub[zzcemywfdswhvjpl]ockclifwawqsyzt\nhyetqdpieicmycip[ciwciijtqspvydxsdu]zjrfhyctplqvypy[hdewteddlqfaoifgy]murcplulddvzheegmgd[rooqfiqsnkjeelfjcag]pdzzjacxzdzmmgmqwu\nnufvveulfkudkrvskbg[cdrvqfofoxmqwtv]jzgfbywojzvwumo[vvshcsjnhobkayk]gkwnyerwhezneuze\nqhmjnzcokmkmvclhfh[ywruoexbmjwuxvrk]lswliylmniqdgybtyx[yjrzasyfroiuaeps]xevbxtsyjknqmeuv\ncrwelvogceorioqm[xmduhdacxyzodslgtv]wilmwenmmnwgqteftrx[zonwpkkjimmmhbrtls]vfbovjoabzwjpxd[jjxievceapgflzeldwb]onucskcmpkgsryl\nujitrvtlzcrtazmghgm[mculcmczwibnuhtunnt]izqgurxwxhwboygvmf\nlespfnkqubxfoqa[exmzkeazfrfrkhzufz]xpunddczqrkxtgorc[ymsbogpyjeimnuola]kufhnwzukrdayts\nmitdlhggspwferwda[fcwhldszpyfznayp]rbfzewqihtcwtjznsp\nwzhbemsmffcmcswdvp[jcbuktuymokdqfjj]zyhqthqbczupmcmkhi\nqulvtldmhliyflccbyg[mqggwujrznjefvjw]sduatqntzkkvgfqel[fyxdewnrtlkkils]utxmideawxrzpewmee\nggpinoooeucoxmezfi[ovisfbmebypyafknejc]ccqkrmaimxmvxhtain\ncqezdujipgzaara[afkpzozyzuitollf]srmeiyjzqjruima\nivbrwakbgkrxpilylu[eewfaajedkwjbdrk]stsichtqqsksydtubf[umxwxeikoyehrou]kwddyduytdhdgdbyn\nvowwatzholrusydvmdb[jarugsbvowdtznwx]oofschlksdrodakrk\noruwtttstrcvcgxz[cvidyuxfxluddzxuz]jckmrrmvolclrbam[dqptqpdwkpewhmcax]rtfmeakahrcbazlzsju\nvjrkcrzvefpxgardmqb[wxmurzwunsvjaxfhik]meiaafxurfgikqg[dkoextitsnfeorgoihc]diohmorpmlhisrs[ibtzwvoovjmdpfi]oelairhwcbbltmjcjdr\nmiafjehtxwnfqzxg[nlovpfjpeclnmlbm]rleupmgzewtvuewypt\nosoaytxzfrkcljfjv[bbpjqntkuuwpgupxsy]bgryerdaukelujvayjt[gycrjaelxuemeosc]jgdfpdoltoqnmow[yfwoyzixdzamgqweb]lvmnjywqfjfvyxhb\noiksidcbtzhhtnegqa[vdxnacjfxbcsjzqdq]ixvwmdqdaleuzjniki\nngbyqfvobuxdnjeqia[ksktvzdyzkvyvjrgkos]xwuslzgntfwrnyqrod[cxmkhhwyremunrbc]hijkgxizhlyzqfaay[ljwayjqxyrduyoebm]ancrkgmzboqtwkjah\nkxcifwahsdmqasrmwi[aqzdihesmgntomgmj]jkhmcqvxqxtshprsy[wgewbxfsobokszgsivz]zlpavaqlwvauvedwf\nibhzychwgtvobvws[qaestubbbtvyylbr]ovsxlggntxnneirtot[kgqrkbiqracxbnbi]lzpfersavecdddsytb\nabjcqoeeqfhvqmo[eferwxtafaxzidjzbr]qztbvxsaiyqhcsdkj\nuqqngbvhyfxovmdods[zwyybohwrhprvxaaaio]cgyaactenmhiokzh\nhiqqvjquvdkfcjwmo[jzrxnmbrqfhjhvppdxm]mwvibfiltxmwroeruo[fasknewgpsmftnx]aubymogtwkseupwmr[xnyevhhalilxuxqqvya]mastwtyfihocpbjngaw\naqvkyxqnjtthgkjxr[ahvjgtzfqetvqhz]vcaijasfqaygnxmdba[loyjulxsgyldkotlefn]lnzykvlsbkyuvnqb[iqjxfxdmjgyxboyzr]zbfwxpxbthtwtnjdaw\niweumcmplhykolkazmb[zgzeryniuwebpka]hsuxltmwyxogseiogl[ogacxzbrbvopihzm]ipogfmqtohqqfvowzl\nhlvbzegrmbrgoepemyh[luscnqomtcxbpxjmxvx]tipsuhgnhdavsubyqha[ozroemaxbdbcpnydjqs]xqdwngpkteoyyvkq\nfgpmkosjnfnltkfy[sxqzypihbntsfnryubc]oygetjhbfvozerfzw[nwvofzjfuwdzxncwvo]nvbtoxgwkmhnyox\nkbqkyxwacrffvkoxmb[tqfooaoggaauopcanz]ptiakppuyxzwzpua[tefuhyaqzyeteexrsj]hkuwublifohismiqg\npdbrixpmacobfnpg[mxmgtvdlsuyhjnjxz]ghuebmnxzqfljxyutl\nichijthjvilenbfg[zeibnuadotzachqyvej]qogvchvkfeskckvmxw[plyhbwjrhhnvdumajut]xazlyayoobgkmevrpho\ncbkznopiuqsssvle[gecuynehzvcmfuzcaxz]qfihmsdjfsxymvesb[jtriyipbkkpfnazcj]wbcwllfdxxdzrimwues\nntxzlslwvxztbmola[duloarwqzkzxsfag]nzrsxasndnrktih\nfvvowikdydblgts[xozwhuhhngdjqnbry]hkcwbqloymkqjyzpj[xfwuoehhuljposct]ashitwoprqcooweytiw\nynbifagloxgkzlydhk[qoxltvqdpmqhawcvef]wfnbtiyjafaqfujr[crcuopstahopywinvgc]ppxsgbvevlrkdgsv\ntdgutgskbatswuizuv[zpmhakbnxnkehhf]ffuohvkaxpiptot[zlykjduigarhxygukw]bucqoskhlesclyzbpd[igdjnevmqlibrugc]seyjwcizckvbncjwon\nholbjgzpvhqirwrxts[lpvaadhoqjjwvijk]etjusqwbrccaqea[livhtrfodwoxnkvk]dmprijbirsnzuptikc[icjaaepybpgnorie]imtoivdxpujjmlegqn\nljywtdshrtzqzrln[lqzqgywtrpgszaigfv]vjyyvrbkjdiiminfas\nxfluerhpuqsqnrq[rtxglsxbetzajmo]bktotbhryqxdqfaf[cptmsctjrifdojglh]qzpxnniqwxlbvnexlg[vooexmzwbpulnxxv]eumwdzoixhfxkoavu\nxmomvhstjavjyisvhs[suremlzhaiwhikzzojb]urbiiuvmveiapcybgz[botikbmkcfsghtgtcn]jbsrxdkpxnynfibgxyw[agdmtydfehaujynym]xfpytnqyoafnuott\nxjzhgefdlodsdahv[ihwwnfbwhcjdbrdixy]kmsckqifucrgpocyvc[pudtuuaebkvsrflz]qjfwaaylzyhzerjbhyn[fsnmlxncwzsdsqp]edevlblbzmwkgkfluke\nqxlppzrvoymnsiyb[ybyeqxwtoberzwvcdlk]zsofrmazkapwiuxwjjn\njbdmjeyxyksaonmswm[vhxyxtashfdrzjzytoq]jpkbmclxjtprrhmaz\nvxishfigjpmdwufh[oykzgieieiypyrqaxdx]etgleieyrezvbcg[scrtyttykipejzmuhy]oxnektqrkndltaixnj\njnetcyoxmhjfyfjxm[dezndcwpoghexum]xloobrzxrvanbbh[gvcaufplrrstvrf]jgdhedqsxchoorlai\nenbtwxacyokhcwyhxp[ahjgrmfhavhnhqoqsfs]ahdcbzojcfgzkjfe[gtjphvcbwzsiohlha]lwaphixwqbmbqhyoccv\narwtwiiowytbbjsumh[iwdhsnllysydgbcuxw]kummpwhpyydfdaf\nlaidhzhbdwoezqhi[eccvqcxwasyyzqvhrw]oobigxsojqsyijmjmu[kinacswultmqsxdhw]xlildtoykeuzgzl\nfbwcshbijakfapcqzj[qktwqwrlnuktxjvuvn]nbzsrphskcxzuzho[lrbnsyzvrorznoq]ewytfrszdyhcrhpcx[bmzudjktpnqxqwmblf]xtwqqocsaxoluhsh\nxgnhvwkwhfbprypnak[yuwpjkfdxygltniuepa]mmbkjavsboilcvpp\nhprznssbfrukcvu[mojrsfuktavnbhzty]ipdxnxmtbvsazyx\ntfdicuergiqhvie[wwpqnqkyfyhuqlb]wovoujvgcwuptcqhkd[whhyzgbflhplrff]kezriqiamcvkeifegv[kcbdxrvoharumkgzufn]xypaikbmpsjqcbxrrp\ntkqpijxftrvwkam[yyajdcxgzrkhkroq]qfrbvprhxlpgunqqs\nfvwgqznbhbrmcaubz[lgsawqyuhadojbqwrwt]gzbvdgpwjuwqsgokqy[zpzdukphcvdqgpdoex]atanoaretkhxbyzw\nfispfedprcrygxs[xqiggqkjgjhaskp]thgqnbgscmrcfqjckbw[tvueixxvxlsnaupqed]lshjncmwxgzzczjssh\nfplljoayuqmjtjs[vnlhbmvowousilhym]emygvrnfsofwobaducv[flrnwxzgkghpboubuh]sdndpovsuohytnq\nutkqxfkbxtoudnbh[bjatbltbacnlwzlbjk]eunawwbizxdytndqc[arhtjgntcqetkeikojq]jfooeguervzgzgudb[nhifbismjhcwqyt]xwsxwzwwvtqoadmgvoe\nbxbifxmedhwkesbmjff[ncfbdgsqfejalnqyar]oifushwlnfxghktjhtq[gnapwycvocshetc]zzslupkhadbieerb\nrrotstdgmwqowfmf[zlddfgpxgucuestu]dvlbhinllnkxdybha[aovlzdyhamvvcgm]dzehxcilzoxrmcyhiwb[xkeszyasnqsumpx]bnrsppzfvjhiyafpk\nqgpylzwwdjxmepsc[bumaitztsvayatapvl]gotathwcrjrsknrfuk\nodbkgubddtpxdsgmhvh[mbgpgqafpcrymkkdpsd]ieabelyvewiypbkjm[psowbfplvsxifqwq]szgntjujujycbfy\nurqwuzkruqfgejkdoh[qxxkamiyhedlffzg]hnfntvahsaivnzmawf[mxcrmrqtgmnplma]gxcsbxvqcoxpddj\nqzkfvuxmfneyrpysh[clufxjecvedwwegflp]rcxzfazrzbgogna[ogoplmljfwvizwniudc]yewvacqgzcjgdnmasw\nmgweqpewhvtdjnjdbu[pecantesazignmq]upotybqiovoujemqg[ipzggdcevkbkvpyz]wqtflwovevactij[ednlhfkzrtfwpuignhd]epfijiuwnczwxdmgvzd\nlavqyaejctfofhdend[enxgzalvzelvvxdt]dkrlwjpuipwnqvuv[ishvyxwuhxdxujbgkev]euytwzxkpwccexc\nhaibamsiwfwmdvzu[aekmrvauzoxdbtury]tfgjabbgdrwbzde\ngqoyggrpzhfgrkjjw[kwhwkctzmjdpdoeey]ngurqljoormcjarv[bmvadfmdgpwpzfiiv]fkfqchwhedeymsa[etqtnxepdmolklpa]tywoaqpoowybxcoqq\nvnvmbxxccmctcba[ncggihzavxxxrhb]mblrxjgtypycewg[syiizsazwqrhsllezvs]tpzocblnycaokaphz\nffpbdxvenqkihvvsi[bbukwnounmzzxody]bzfefymopdtkpdm[sjbemcyhrspadzkuwi]xlhinxfjjeajzuqjkuo[zfpeikvvdfptpxe]dhsjhnwlzlcxbkz\ngulvdtkcmjewjchf[auqodvrekgvzxzyiwee]rarumiavqvnbyqu[xywssgnmbeefrqgr]lyyjmkpmqxmjbughzta[avdsmuyfdwvzrzn]qvhfqmazlactaxtxi\nvvqlvlsnrxwhoxfnac[sablzmrjccqvauyjfao]avdnqlseflqxtgb[masnpoqnvjtkreifrvy]lvtoftpiotxcstvu[vohbaippdypuwpkuip]kxffhmrvrbmvhecnui\nkclmgqkaprofpmdm[bhbitgjmddxhbhu]hmasnpqsttrgtmuq\ntvqcqkarkyqtpvea[fjqrifichijyykq]qqtmxszpmovzfvk[xrcoyhzyxwmqwujxp]nzlgwxpkuersepyhy\nzalveeaqakqjhfl[uypjekwlbcplfcasa]sasiztlswzyhvpd[weglkkwlrrvdvfd]mvsdbveypnjsymtjka[kroszrkveyammdqqool]kgmxohwwgmvcdludvdl\nxbroawhwunnamvnaogo[uzdvwckcbkaahqltp]bxudkhzxrykrkffaiiq[ljfeimkibushcpclbia]wztapafqrfdpwcwpyz[xwzhahnbnaxjorpkaj]glhfrkaiizzidtmfi\ncycyarwdelrstoi[rivlkfszzvyljoa]hkjtyvycydwronsgyd\nmbdqighfupmzacpi[keeoafjlwzqeoaryo]vjcwhcjkjkandqir[auactffhpuwzgzm]ybkwzkxyevwrphq\ncpiuxmmwrsjzbyqkfms[buipqvxsetxzsgqi]tzwpfhknlpwmtxzggc[nidtlxvnowvutuqv]qsohatjnnizngzsqxxr[klnzvuognkllhhr]clpjgdupfpanyxwjg\nhhtduiwmfhibnpmhjm[emakclmaqjnvjsjyt]ntebrhiztekglpmhsrg[rgehmkrotjobrtah]gzlybshvhkoznupnhr\nhyzvardyeiddsgk[vszukhazfkwqsodz]psztzqehiwcpifdlna[igstccorevbmgfae]vdapqjiijwygxap\ntowtxxuitgwhddsua[bydcnwqycygmimbrut]cvnvgtuiuduzjod[gpazublcnojkfnnvn]rozlfkywwjelmry[wvtxeleixyqstxjqed]vsuvzaskgyooigoczd\nuywuytlehdznyxr[goerwtisqdsinimd]abuktfxdobkfqabm\nrolwzkzesawhyxddo[yuuvalxthkptulugzh]tagfpsdniekrekzkt\nnstbvilzeselffses[cpgyssgpjimcevp]ehfkumlscjuocclfhel\nidvdfrmadfyhafvyixs[igsqckpzuelddtl]eclbbakcdyttbtse[irchopmhiqbeloiqq]lwbecblskhopzyw[yjmdufblseluvukftkv]nnawapbepipwcsfz\nthqwduckwmjtxwwmj[ppnucfmtpcsawxvkago]vojtdpukjwwlnirsvle[cscyjfrxjlgxhyu]fldolxqfbxhigdom[tgacpmzitahxucqpzke]copdqvctocklhvrq\nmaseolhlyrjuoqdazl[klgwgcdfwhpwmnlklcx]jycbhtwurlwwsjyuubt[cuabclvzukvmoiniql]pzockwxqjbtadsspl[izzcraalbnmcopcr]cqdxcrkdnwclxcitizq\nucyccfdgxaciwhx[txuygxhekywmyuaaina]szfdjuddiopneadpot[zpjsnpjtmicknxkybi]lfirzuldnatglheyhnw[rhgqfyfxlaunabfqxl]hplszylhorbrkuy\nvmgeqazfjldqcfif[fuepxyjuuzxkect]ywoxrfdxbyjomjo\nqacfshruytmlwyj[jpqmllbdypmnzqoe]sdhmtuefjbrmvmeby[xkyplnmmmcrcmixkls]motyvnyucleirbnmrys[zdopkcnnuvxmhrg]feeagfdkgorsubr\nknlaaiwxponscqwtqla[jxilqsyolsnanzxvqi]itqqqbrfpcexbnecnkw[bpcxykvtdbxejlcda]mxodmdxzohrturffnwf\ntxvqlvddwpcysvkctlu[wvuoeprflcpycbghfv]ksbpnggnitrxkua[hqyiyucnvjqsceml]uwwwbxrjvodohwznlx\noebxtpwwjtewgkwjbv[omataxkuqenxmxolwe]aiepvclknbgapqh[wywlrbzliilwwvebxbl]ljsiuvllqbjrvqzh\njznegbplekeeohnf[hegaqbzbjwdhgkouzja]msaozvrtyshcajexwen[cnleoafnzyvbvdfndha]guawhzetoxlxmjwt\nnytoqgolirudokcgok[qjtvenvrstrjjlsbvzq]mwhkktxfsokxxqb[pgswnhmmgzcrgjbqcx]amhrxgwmcnykgpuzfb[dnihosgggajabkoq]jtyxfrifreihydzwjdx\nbxihyluintytvypxhl[kbnizownozfekbhmsp]sjgxqgjbhoftgmbck[knoibzmlipdnfca]ofyxruebaspanxxhakl\nxhrlcwziflvahls[babpaszszfgfywj]gkquumhyqvozkgubcs[gkjczyujqykeifhsylz]fhmvopfsltpzijdw\nntyxwcfpdgnsyau[eqjxtsfneseakvrf]sbzesbxxrrmpmlazhi\nlwakhsvcamfxiceusua[ymczlpqkoiophom]fiybjcxhftziivsrsok[sejyfiorjpptboakf]ipsamdcnfnlhger\nncgeewwfszytkag[kizbzwnxepsvdxsbzbm]fofhxxpymrbqvcco[swphuoqvhbpghtku]hvxqclwgtxxqywhhs[ibvpkuiylqazccin]oftqdvkbzdkmycntx\nyhnhzwjjsiqngmhe[jtkcipgiclbqublpfs]glxyczwidjilkqoa[ytsphdvgnawjsctty]xdofsnhnpsylvmso[pmjrjgiwhqfegydcs]ylfcipikfzvmpjn\npwlhyvxnneepoqexj[jsnwzbjxibgqnpjgdf]qndnlnzxewcrjio[hccvunupvbcyptqdihc]rfhmapmentuhoiv[kohfhnoakeglvnasojm]oggzhzybuuupwdrjrtj\neyglfycgaoqwsqqnue[woaxqinxtvrhsbjjvnk]cfnkhvorifhxedbmbmq\nnrqqggalpihpjyu[dqbqopedkxhoqqnp]qguazmdjtenlvzgoemw[ccjlmsdaajwghuikrnp]xrjcyfkrrfxddnjn\nwkiymdlskwyjrft[ovucvqbenolfvvu]tzymrvmekxnlptynj[dupyullbzepmmrmgwe]fnjtcvrvzstijxq[elzfqhyjdyprzfxa]uszwjwzbbzgpcavynk\njrdliqwwffvgzpu[mxoivfuwuqvtxqmbbs]tvtlqzqgwzgshkpw[hspnaspqnjvwybzfzxd]clkhutlibvxzxfrgg[yujteartlwdhzfgsn]lyfrxjqcpkcvcsnsw\ngtfhmxlpptgvgwob[xlzqaoawpmmjwszqmhm]xalfbbroilfuzzqm\ngqxmhinpeppmdhbdt[cpoaeltrlzmfgsipvg]iqlrhncmkmjijjh[xsbdusetrksrxjiofj]zndjqyxwvmsnrbcyrmh[qnbxczovjlrrvilks]rfpihmkwzmgxcynu\nabcncmuhelkxeph[crlbybjylvbgtsk]yvnbosicedmzurqcm\nfbhtialrsrrtpwcxxh[pisambikwkesdtbsj]zcdseybwrdrkxeiylg\nsehxfywgpznuuypj[upswvzwnkinocjk]nabhugsxhitlhis[ilrwksgypfqgfexvuhv]torregbntatolgchv[kkimpdkcxhsxyuczj]xpfacbmnrhcxnbgwis\nhldgiynbgrfjcunattg[nwfovbxygpkwmxnulm]xleqlwcajqwnncww[waoaudnttcfdktcd]yikfvdmekcexcrhsi[sntclwlhouhyjrob]wqpclaistsngwfmf\nizblnsxlmqjhxvx[qpmqqzakbjpbapwtlel]vmriwjoqlrttqpoxay[ylqzxxdpycurefadv]ftcuduceaycwejp\njqjtnshmtsvokhwnpr[bxprgnaltcsqdkceygx]udqckcknpvegeryj[zvjfvligrqxnpypoerp]zhzwojzkckjwgdyu\nohxpnvtduqvsihjt[eczkrdqlgyddymrdjfj]zzqhfijxsgoisbwpd[lysfkgekxvqspagq]kemxkdqxetnkyctjp[bknjdsvchfxflsrkuum]wmxncxrwwxxxgza\nxnulgysrzxheppsiril[hdxgzhscbjhkcntrmsy]vhedyohrrqclnoe[nnuxdbtlbjvaddo]xivkwdwvmkplsvfaal[omihwmflpvrshkcoci]hekqpjtrjlsaomfd\nhfyusspcypxdbgzb[cxbfccrumbqqqxb]ygsuxbxdfkisqwstqp[lqctoagvchrmggtmo]dgmcjusbvlmlvkdmnpu\nvmpobkctlhdwqjyb[dxeinhrldspqhgeu]ndglldouuoawkiwtask[szkthuhxdkmfqoqwwgq]zwjhzselzvirjadzvr[rholepzsidriqmlepo]yhbxhcmbkvripyusams\nmzscivdohxhfkdqet[imwvpkunuzbhbaj]tohxwppjtsjykxrj[nhonsbadufgsqiysn]cogovslrrwexgzujn\npzsteeyowqmhzaqao[qsbohgqamrksizzs]vscfiltkxbxwbdlold[psofpwfkxhsxllnz]odwbidqaqpuchaew[kruwykloeqpcrjzon]famaoipldevywnouele\ntuqiapyobwqwpwbqqu[ycphsbdcwbmklro]medgafihivwegukhfof\nlficcecamifbjwk[sdguwtafkigjiapxagj]hmeqrhxptojctevbdbu[zvxeefaytjajdpwi]uliqtzilzcnwmbfusnm\npvyzncrszmuienoptx[bigapupzitygcxstqx]rqikselsbelyfjdm[lyqmdmfyofksmecg]wjceogefnlgelpguu\nhmddytvxqrazumnnr[hpeurkbdfejhlfvg]pedwizmuhmtpdwh[efikgkrhnagpmqypzx]ltlncfegswhwcxa[bakxhwhtvxcwcxtmofk]zwjvbxyvljlfaie\noxgoszggsifsgrck[gruwptjveewmfewguku]otchieijhojsyxi\nkunxbbrdhibhtlknrq[tmtsuhwakksyets]xdugxmqcstdallfqgq[tticbbqirncbjtx]knkygxawcwdhefesu[rerbfffgddyehtvl]yasblwlhikbvjidgku\nqoqnwslopcpytqy[zngrksptgviifcwbw]nuislpzizqikmgn\nkhmctigslwdgzghkbk[veaqghpizqwjxlwcf]aymehevjgpjgwruhyc[hzgzilbhyoazljsk]jocgjmooxqxayzsa\nxodvowdhvnquwtma[kvlbfwwzeuucthg]djlyemkbpudpjlnrkv[cbaqlhuwfwwfvbdewx]vsjvsxsizgwsakpx[pzyowqndqdbkdakdney]eeylqpqpuqvdyyr\ncmdykdqavxgeismtlua[iwviddbtauhirfcabh]fhpsinbnwrcpxdho[tdbgrmgscvzukjl]rxupjtwbwmtgnltbjp[vgzucvscpzgjnvg]zftzsshpmizeksiz\nkfzmwzmzdpxabvi[ftkotbrorpkpfxzbg]hgbrsewdgnnqhxvueya[lkjknzgrbuzjqxwqseg]oyzaqahfuqtpbzi[yflzhfxwkugpetsqli]nowgjqaquqhrlxz\nktphtjqwsitgbaii[tjwcbyfrpupwkvzrol]smlczhhekwxtlvxdfn[mqfupholnlvfhuv]mvdhzncezgunydrk\nlrvdftzasxbpfgb[pglmengmgfbnzxz]hbasbstksqkkqpwkcbp\nsiheyyvdmjiubhlapns[xfcaevnaoexubdar]pgbougfzkmlzjqygdta\ntblrafqbjhwzbwbe[iefobcqdrypwnwidvm]olrzzrqgkwiefngf[asvmlckavcwtuosgkrm]esqsgwmiyxncjjqsqp\nalvaycnbqdlvvnwcnq[jwxzjzgpnzmcampkye]hepmdlzjvxhboxh\nmtfkavmnrxyfzvkes[gmwvavomsyolkahey]dnqosibjkplwzjojus\ngbckujjuhwnvovpfqw[qwievsrrtusgzbscuf]bnrjcovodutibjtq[fxteivdfkpixonphrog]mnumbxikkkyeositn\nremzamtzlhwpndrknl[xgrbcgdvlvrcdrpi]tnzimcpmxzaxsgpu[klvglrrepqxiiewn]lozcwxnclirneaky[nevhtplqsmuhykzqxf]fgmsbwdgfwjftndzi\naybmjypdrytigyyip[zafsvprjirkniuwr]wfdyfncywtdtzezdbtm[umbxrtflhquwdofgut]lyjixlycobwpwvhfp[xoxtkyhvwqgawmike]bfqtgcxvcfwtdpl\ntugswvsgbsfbiyzcm[akmlddjckugylrea]fyzltfupxnvagbshlb\nlcgvlozzzzpzxeoee[zsvjydznyoadkvyxlsq]wqmgagbkerqyxjnnx[isukybwewezizpll]odqwazjphoaqhzltms[gtqeysqpwuuohdbhcnx]yqtvojobgaluizidrbn\nagnxxgirnprujhsk[hagcvuqcwyhmkdqmn]zehvuytegijhnfqnk[ytlokgpipjcviulp]hsomdskdngoysnbmg[wztsneomppnewhrl]gpkauttapxhcjrsicvy\ncvnowinufvrjpiqtq[kuavqbtrcelpcuasmk]poksbapbwverccds[qdddbhewvxgfoldib]mthrvrsfygbhlwlkcs[zhivcpxibufugkpigzs]qffdjnrsoigwxqhaf\nkovjiaxxjvzmzvmn[cmrbwjccgphtstvaiq]onqfbpryjertymd[sgmcnqbseodopnnd]gbgealygrgjnamdq[yrjuwjfvmsmgbur]ldiztdwrwmeqrohy\ntluglhveqluxpiy[wrsgxdrzuigwzfsby]bmhqmnbecjnyutpwlbk[iifejjworkzrsaj]illltueflutteej[adfixnftjenvyrigmkv]zgsqagrctomzublltjm\nfhcnrceynkcnnjxj[jrevstsodmhopao]zqapczirtxrunfhl\nrzmxbxurpdmzgef[agevdburkuvnsrof]rhclixqpruwxuanwxct\nvxejrazzpddvobzlq[dpspaddyabqzrjgvv]elcpgozzkqjsasufcv\niaodnwpcpresylkhyy[dltvlrxbvnqslzzyvox]qownkehbhjprbzf\nkqbwgctrhxwrkkedau[occltggonhshykttsrr]snshslgqtlgejanlg\njpesfmiguicqdcnkm[oawppiwdsmoidvkcre]wfifgnhqeisplngcjkr[wevtsiuznmpapke]dqgxavmudniuaml\nddewtwhdfjatjlgrt[ceurnauksrgwzondnb]znsvkdkwsimbmdxfkh\nhwjwuhdokecprunbju[jhftguwujsuetdriyu]vcgpesthcnwuwpwes\ncgizaalsahfzkcxab[nehrqohgkmbxiufyco]xbnclpuepsanwrwjoo[kvdifptokbtlihgx]hgynbeebmdwbkwrfbh[rlypefyljzefnft]wwevofyexvbojyc\nckxkzlpwrfhwzuep[etqgjhcmexxvaccx]qqkhjttaudjpbjboeo[gihevbqqqumfythcfm]hraqbarwvqnmvtiy[cbnfqzxyjcpmwvu]lrugefybnoiopvzi\nbbmhfnwnuhvdgmoibjq[eugipbrefcqiniulz]frkuvbhbdiaoaqdcaq[ksqqrrhjltlxvet]cdjhqazjzfrphjzjr[aspkvkpmwhkzxfeic]vkhbjolvoddtaasvs\nrxkbkkhnaiudojzsr[ecdvrnjjyzyqjxf]uxctotuqtvambwea\nsaknwxxhcybeglwr[molhqlfbvopapnuco]hbbaomsdwcfwvoi[rlvhmvffqcyftricsyb]pkeuoigxjpwfbffif\npylywhhzktocomu[sehthaaqwkyerucg]cwfmpqudeylrtavze\nvmawzgbfmmsivwfqclb[fpvwdbyrfjgmidxw]btatkdonphkxtprxfsj\nkspofpgsttceoft[fcqagpbfoujjulhp]fkbxvsbuwioyngydy[hnoxyyuhdviahwsf]gustmoflyrtelseo\nxyiofnffruqapvtgnr[wmigiedeszezgunm]vydqpobqqrisgtt[kolobhezpsiolofxrlq]abrzbbmtlqvuhxl\nenzmvjyrzypbbtmbvx[izvhoqpjgqgmmvricf]dbghstbtqgqawqjr[irvprevogenchjy]gbiwvcxncbjjvwmshsx\nuavpufepuqdbjedp[itqmeflkorinwdpjwp]hlrnsxymcnxwulsmfk[bayxjuxhtpcwafadefe]srrkibtivlskepjxamu\ndlwhxttrwjlxlit[atmcusmqvonodkfwqvb]ilfdsqjtjbimpaqht[zsbqjwsrgxlxbjqmulb]feblytbapctmfuao\nzfzicvjnuuugutgymp[owgyvyjfhrqpuukkgok]dfkfwodxgvrdqelliaa[xaumszuhzjjsxwe]ihaxfxpxjxcbhjg\ngmsgnyadjfimoemyzt[fjtprppdzhkorpqoo]eyxayeizyntiumrgk\nwvdatykekdfednl[kwpjrdcfjjklpdofpq]lidlhawqalcyigapvv[ukqjuzvvxehbwzhsci]rdrfhnobcwtvivgcc\nwvqxpnxpjmzfnfy[xgtkzusumupupuqvn]vmxceafgkxhnosupdkj\nypfaupbycoerlpnhvk[pjrtdmwsmsckcfongoo]bjxlfxbekwvfruvy[uccfekaoczxlyigfs]gnvkjcwikenkmvgrpdj[yrtbyzxjkmpewjpbstp]nfwcwhereraqwxu\ncqxbsrqdgqudcci[olptuqqvfgunmstjc]xnppdflvdcjfviaemlm\nasywjbgrfvbfnkhnc[euubbvzujqjnsxtmel]gwxqasfbyjazgqodfh\ngvnexriimytwvefmo[dtuxofcgyfnaiibqx]iaaodpjwjnkbrqsmdzp[nuvnumldfhglafg]dpcqqfdrekqdfyfe\nhnwaqtrqgztvegfhj[mzqkcvhmqhzwmhlkc]kytpmyhzrvtytwvfkqk\nlatjxjyjkwwnvyrbl[bjnilknxprpwziowcjn]zpdvccsjiuhfwrkn\nnowozzvrysgsfhxd[lhgxyitirlsyljl]nodxmmwtydaqkoxvu[vgbjtbbjqgfbssytsk]gpzprrvyvseifydxz\nsjihqhaecgshhhdrbto[goawszmxrrdtoxq]qvywgrnewpsordounhw[oaxydcsvrzzunbizz]nzisqsdrmmsaqwt[nmyxmrkeainaqyfe]eacdicawhfuobezyao\noyztkiwsxqcufgqk[iyxqvktohfnoymgisag]acfhjawamdhawitvjg[npflzsugezpsmunukqa]vhhxnunvyxjtehyvv\njzfmuzdlemckyiccan[rykdnvtoavzjtjxtx]vcmkcuioriltvpzzxqb[jdgqayewkwcqpkg]ulsujrvqzsmnpqgvg[lshytukyfqhnjehk]cpwbeyiudngpkrl\nuruvigtkkoqkfdbqkre[wyvcwnxixwkacuu]ajvziogdmzueetqzxxx[fyevgfzreomzjbsumi]ahbhcyjbadiacwjplq[quesxyjqfbckmnt]oqehbkjyoxsyczfta\nxzqfptkjpiknvkyzzt[hklpsitbnhlozgp]pkbgrwmqrbhohay[mhphptvyseydwfq]ehswmqarsalmcatb\nohahitbjjxlnkyb[umyhhgtcasbfbxqx]dxyhbvpjjatkwvpkyry\nbcixbnnzlqxkisv[tapovjggqzlwlmc]vwnosivvmdcfsor[uaapwzmzarenaplcjp]jdcpazyedcdkdinrrz\nkdofbgwblzpnocgpq[scfdzdrueknbdud]axnfckaaghmrpfmk\nfisxkiplryvtnrvm[sypuemhvxvohsapkccc]exrrwesixcvnhzpopk[hpsilxrztuukzksyax]lixfijobrlgmonzui\nzjnlscyhmjmoofha[ezglbbmqulybnvf]qvbharzbfbbustsm[tdeqjfbfxeiknfr]chpwwntytidtnnjf\nqildxsfzfukzbmre[jykfpbbfelicvkqov]pyemzfzobutliokrrox[uplajddwknupdnfje]vombwrjguiukbiwozj[kcutkvgruxqqcuykn]zsbonxyerpjkfpnxchj\npdmfyadwrblhcvecezb[fhqgurbenzitepyh]xhhtisxbusntgekaps[yefgbqwocpsexwq]emmlcuwjwvluecbfo[ohehzdjljocucatf]zmgbwenmeuiftywp\nxhrulprzdnbbzenux[ptzrrcmdscsuryk]ognjzqtletsyrcy[snpqabmryhyvcyztmd]lhkwhjylportbbo\nxphruwdeuqibzdss[ubuaiomstyuqgcgzyn]upkpgfqmamubaqhkao[ohjojarsqpjldirf]ianntdwcgclwmyzwjh[qqeajbudidxsqfw]nenqeljkdyjucrqnsgd\nxuydzitbfqwpaafru[jasqmetengbkljylhse]wkqxkjwkoipjfhkafnt[uolbyhzhmtupebneng]pcjjrczeczmoenefu\nievtjpcjrlfqwisl[pzhzabrlrdeadbtpyec]sowfrknejwbuvgs\nqcuiylijqwfcqwjisqr[icjobpbxzjzuaxc]pcrdpfgwajrudfhxb[oiqtbvhfvitjvuts]ctwyepzbqlrtwuclz[smugjsqssswocjyc]lhlncivlmhmoexsrd\nyqmqbdhiciqlgdmf[rywqydtlwdocdih]ofxwyqckxktvcrlxsx[rxupkwzkvwrmhuiz]znbksfkkqxephhb\nbgzhbpweidflkmmjc[gxozhwikjiygyrm]vykpmxdywyfummana[mcqteiumnmmoyiwtcqw]ntczagaqoprodvhxbl\ngvtyicyxseltoqfgk[eozvokbnjytodemeo]ogofokdupjyhzdgrk[fucnzhyuqkcakflcky]zfgxqfofzfdxyzetc[kdgpxyithocprbr]rpqlihcmgthswhvz\nsvrwqsrlntabucyssj[trbqnxxvtfiatqd]isjqyfxsoarfetrtgmm[lnwqkkgqucipvocrk]cdcsuvgwvzurnxleuus[wqjewzmcvqhhgwawyo]arzledaetbnpjmwjrl\njttgsvurypqumflcm[ccznbkqklwsxmva]ooughikefyugfvz[rzsyqmtahohpmnq]kyotvedmsjfshan[bwadbneyfitukleqbyg]oyeonratlyvtfbcrs\nrpbklfvsjmisbnowf[vupfpfstcrfdxipqi]wuftflxmtftrcrb\nigqcfvsqbbvpmgflu[kremgawldkinlqnr]ogcijqlgvrvbloj\nncjbiybzlsophbdemtc[zszwhtluxpobqclp]unvkyqmemvucdtwt[bzmibpkgwokausrgo]btnixophsknmjrqozwt\ngxapkeestvvhodxnp[xlvglgrlzjdrpjrps]sephfhztipqaftxnqp\nzalwvceeodddhqqyrk[znydhdhxhprlmip]bjijtiotyvfgyiou[odtkdhdrwuzpgwkf]kldnjprzjewdeyzmdua[wsdyljqvdmfdenajaks]zcvlwqkrytjsryab\nschsgvlniqevsrjfkxw[drtzpizdeopipceke]bduaeqelcxyvykt[vhoefhavfmuhjkgooub]tzgcfhwkfuvwcif\nwocmjawhtyhxksjiktg[hftunpxmlvyxauvnfj]spefcqpimqgjhnou[gmzejgwtyavnatavwju]vccngpxjmmxlruac\nigqxjgofompnnrsaxoh[lmmrwzhovfloeps]loixvtpiyzagyvgq[yaiiiuvpjpuldqk]jwpjsgmvglkzuiepr\njgvoejrytatxvfqwt[hinkejefiqlrpqy]cgmvjuyjejpinjunld[qcdmwbqbqusirlxh]udhmheqsvmqmczbbofh\nqffigxgklwwslnts[gwhobujjovmwfmrg]menqzjmmxrgchttltek[fwegvyhranuutxgxec]fwzgoobvkjekogpfscr\nqlphzfkuyrhvkmsfxmb[unvtasxalhelbiw]gwqjfeftpkxtfiru[dhkyfsvpktyrttk]mypdaocnergxlnbodpi\npxdqzshlqhkrhzwcqkb[tudazezhnktsxxexyq]ybzclsifzrgndcaxq[ewlslzvwnqqwvljgo]nwnyptvummeraaoow\nysivygqkobbtznpxy[ydbgipznapsnkzfq]upackoodqdqmpvbgc[qnzvzwnbwrvgvwn]imcsgjzzaeltfxyhbx\nhcqlfxoahajthjesrdy[nammwfgfdqnjewunwz]pdzecgfgatymrrntt\nvwpdygtfuvbryipr[ehziaqbphyzzdolbfsv]rqxvfvafrauzncapu[dvqlgdgkzgpbjuihbl]sdtldsvjvvtlvjdgd\nrajovnvmoxozjldjd[czqnvirgxkydoaaxr]dejvwkgmpwqvnvnzzsb[zwxifotwvljvpkxae]taoulidxuvefjqxjdu\njywqykajspyzvcw[jkqxjzfmvcrsqszgim]fncjgfxwbvfdwujhooa[otrkhmvyonynxsyap]skgdhtgcwmzixpdgmjh\nwbkndoivecgnkrid[tpdmkrufmawhpijryk]untkposunbiezua[njngjktbavkmsozyy]dqotrtnnoxxejcz[nyinrkqzxnsaahwa]zpdibcyegeumjjgowz\ngexzzkajyulforpnmb[mwihfmwsdpjjsnaxmme]xavowvaqybvqcqescdq[hjymwnhorqcdkoxv]myycpwmcpxinhru[koqbxfaoankdcpi]hgdktcvvxvoolccqcy\nalpcsvxjoouuhjrgzo[blnjpvnbtcufzsxqn]ipijmuwbljfwuxotk[sgpwkohrsfeypqc]vqlggpiytetmkifwc\nixbszxrkuuzvvstrn[kdgfwhiapjrtiervwi]iugjmuvqljcbnmumal[ajgjfwerxsqqyrxuvob]qcdagpdvlnicajqcooo[qtuiukkwxyevxmgijtm]bgfetysdwvceqjc\npdbbmswfeutwunlcm[ywbxptxhgqpjkpeenbx]wzzaxgyiztbdftpm[lbeexhgaqvezxfef]fqktklfxugwifcfaio[ucpewlhkqnbsigioumy]cawftwrwmbnfmzmhd\nxmtduxirbkbxjrqkvg[ythlqfokwjfwowrq]dguxbidgwelcrbxahi[mdumdnvbcsicvki]yhdgylmjisngrkcnbne\nyzilepuvsfipivcroyu[czocwppwvwxjadgqpc]uoypwqxrpcpdzmsyyqx[mzjaguojtnjobsvpdx]vnsywqfvrnpipenwka[dtiayvtdtuyeqlddh]wpxkwbagfqncorkomi\nqyebzyuerdwfocyr[cayytpduwkezuatyb]nuazweyhjemncuqpp[gwadeldyzfsvyqyk]gqjdzsuylxshtoayat\neliktfnkrxvywmvr[tlnexbwvbbdeupd]gynrdmuppfbawfcb[dqsidilgsixsudputz]odwsmpcptosjdhrp[mumunqhddegofkrpabd]bnetmxiqkwhtcsgpuui\nwuozzupdubqhnbm[siwvzeelxcodzissd]niswczzlnrokkhrnd\nbjxpecnvcntfbqdyqy[hjawjkugajcwmouz]ipusnakbyyxmqhyislo[xcafwiwiabdlxpaqqo]vaemogopzemmnilw\ndlczcabztkrsdznjlcd[atcfirjxoipnvnoobjr]ujnimmhscetvevwpj[vnbwetjzberefmavwuy]penzvgcewibypznzpv[rqsqdxopumiqfftcb]qrotltpgkmzcndx\njuqqbnfozoikxscqata[cgretlqkyynhwhmk]yiehuxyidjlzpjs[jdnlbxkxvsufsduoulo]ymrfqienfjrrgraxfh[jlopugujyekjzrfet]hqlqjkulbfsnnxyksp\nepcyjxlwzmxwlulhx[pxjecldoxjwjkrndmir]baneyblyinubutjdi[cufdnjpvlwbfqbulb]dbzgyztjopciduxuo[paqntbrciorikaw]jbpsfzmzxvxlrgj\neuufrqxfhnfdzlawui[zwgpectzebtpxfwbym]btexmfeuilnoqsbgmz[hvnxaanolwzkygx]hurfyrjkanhjlaz[vdmsczzhobknlhoslpg]bgitrvjaildspbz\ngaweiazdfuixwqo[qedebtjxaewtracsgk]qnmuhjsbvqvcnov[aabcxwfcazxjqajv]xlhkehyvjohrqkbzyow\nuqxzgyclomagldxv[amcvkpboneuscronwcs]qbeqgbmrdcdtvsc\nxgkenttkfbysllows[bamxgmibkgysryjebgr]dhfiqnlocykclbofdzj\nppyfzqrjpxgouxmsduv[euokodyohaiajyvsrz]xfxsvtjasezevkjwjk\nvcsgnfhhjkjssirc[kfdwqpdjaejqbfaxu]riqzqfwmwnsiqgamwm\ntvxtikdqugadgbux[niaxwpplrlwrnipcnnc]tcunnqamexertrdm[xkxjepysgqqdphb]vnxvtxntrsqrfjaz[akxkeqvlxgaorhqnd]sfhwarxbzfbtftuflr\nlwklfaiawghiwljxxow[oqmepnydmfkjbgkrjaj]clhguzdrfrmcoslsghh\neqtzgxqoviujmxpg[pkkbcdmlkvbcppqrm]zjzmsjmxdkaknido[sellbmhvshvqdsslyq]xuokcgfaxstavgkni\ngstjodvjotzmvnm[mfvosfrnlksillaqs]riecejrjvhdrjvdl[sznhzufedvbdhbeq]msgvdfzoxeykqyx\nivwoejkryedvxpi[autbisivgebnntgixu]papdjtvhwtxgipbhes\napzalddmyxxmfysm[cdzptytpjydinlfdxa]gnjxiwepetlucfl[izgqnvcdaqkzgtpvwvk]cdxqaizjmvdnxigkmvm[cdybhclfttdchsbnyzs]xlqahfrmgnowlgba\nslubhmrmovzbgdw[dehwvsngduvcfkontgs]zeiqylnomqgevvikm[oubxjfwewqtdjwacb]mqjinmndnakfemp[mccapdxlrmrevbuaas]hcjdpjgnoguztrdjgbt\nvqeogkqjnfuayfpioi[rnkeynfubkpmjalnz]ybrwpzhiscwtyue[vnhkeaqwzawibjnvnos]ctmmursouxvylixiqko[voqlscgdnaelsbxcshf]azssljeollyzjjwkxin\nsanarwdtnkaemdsoj[ojswyaadxpnpzcm]acjrepbjwnnpncdf\nuvankqvbgxtgignh[zaimktolqipleig]mobimtizmlgqetrxkft[kooknezmesqkqisip]jdpwwsisdorcrryvyjn\nlkiqyvxlouvphqf[wiibwrighxagoiod]mavajklcesvhiytvcx[ntesmbqoxkadtth]kovhcrsmmtllhai\nilzqxrlibfavovp[hrdmyejnxrlntti]yqmycbqlyitgkumdm\noslndtyjgissmwhqbo[lguvaxjavhlklnqvd]cbmjzevkakhfauq[huujtqleuzhwcbpxjf]hiitxzclsgphiembgwx[ixccjsoybxmjmufm]knmagcfohytzcoq\neutljtdlueiugunxsy[bmbgyvpiruvvuezir]vksxzmgftqglhrowpk[wphxqgxjmzhuqrwhce]giazmdryyjldglcivd[nsicphjzfpfzlhfymh]pfpeazmsdcttsutbs\ntmdniznfpsrdaivxpcp[nlebmzzfjfklqixhk]sbusrwexlbpswiyslbh[tuvimwrkchmarbvl]ykhoceojfjugoim\nvjkixsnkgnhzcsj[eqauuxevvcbzmlrvxk]owiikpkahbpkpuhkmns\nyiomyydjxljwyxoeh[rxyahvmloktamapez]ygtodyeyjtqusou[esemeduybcbngynmzl]rxszjfhelknuyjq\nhayzvqcfdjowlfeavo[mmcaawmtqthurqvmlfq]kbdpwcduhsjfbskcin[sueeedwjrdazxpae]drtfzfbefgvneiiqtsn\nlfsgnugdavjvstpk[usjflghmtbzdzavzgos]vajnuirkzezjgkst[ixiusdyawuqkbnacri]yfhtwiifnoltnygk\nfqvyvpipisvelyjfa[xewusykjjogfsupar]icdydlsidbisscyn[bpibwwfzoqajtnxlad]potpbswobrhcyvy\nwozhxjyiybczbhbqvd[kfsajcbxdespfdewbjw]afcsihkfitjosfwxb[fngvcuammwspeglx]xizamsngscxtprjwkq\nkmakicivcpvmjokl[rnsobihgweztudwrql]wytavzsniyqrdrxu\nnawqmyenftpbvxo[nsztprtyzoacbxy]jiwvrmgzztoisveafzh[kgpykqugwgvfkztnnz]qqmehjutfdzzowkof\nmxddcacabljlmyxmpn[zdlffviwrbhbjhl]niubaphkzsiybwkmh[ysxwkjpjhpyjmosgeo]kkhqupjsegymyxfh[sxxdsrtuwgsznnvhuy]licmdzzrtcxkgce\nhkvugidmuerakcmmsn[mkmrvpqxfoghbyxr]brkgsmexzyvqztplvgo\ninbjfdjjfofwckfckfo[nhjqvxeoedsfzfpwt]snlalnxxyjihecmxl[qtoxbcyxxtvuliams]bijqmocptaquusurml\nwmwfxoaocwtzuhvenl[yzpbmaoazbchjxozl]oulzkybjweqqzml[ydkamvkncxomqsibme]fcuomzdfejvijxeniaf\nclyxvevuyzylpdud[jmwhfhkzrzzkawp]nwcvtlwlwnbebgdz[cbnfsolnppgafml]mxhbrzrialopbbk\nekyvudgmgzgiomwt[ebcbzzamsuhycbcvc]gzmmgrqbbuvbzfebh[lyuflvjhaxkfxkv]bvnmyumtjzismbtig[nqoxegjljmzarvyowo]rldakoyzzgansfefpwr\nwjhfgmicaoysnhmcer[kocbthyqjwsefyepgqh]vvzlwheralmhnixsb[adysumyfpsahmkntv]bnzgyilfgsepwvrdbdo[yqcnxfvzlpjxnvv]syedcecdzbffhmpztd\nqdmvnazvvyyxqjkm[lcmgrtbttzwijqf]gjacmuqivbcttnp[uduzbmcdayazzpr]vabqjkbgwnjophdxwvr[yyljnrcxwwcehamtg]psdjpizyavaebua\nfzjlpppzspuaflfwtv[dqmrdnatqlqnvowh]bevfgmojlmxmvfqb[smrcvucejxdrppkldvg]nbagvxquhrilbzi[dtbbwkaqepopjtgsgnz]zebxmxzzszbxtqeyjmd\nkipuoxmzbydfycmkxcx[bfmjtzvthijzhezx]aiwnfmjhetyrdahmi\nhiekvarctkixnmypau[dafmuxavuaosooos]czvsosvafizsjiouwi\nepzppyfkcwcqiirpm[drxvceywherxdpnxl]pzylclelnhztrgnqb[qrmfgrtyqmlnsggg]seaeqafycqwjfccuyhv[fnwvqeftfesdvyu]djdlucfogiqnrblz\nihjtuvxjkvzqdpepjd[xzmyhwkdjooosritpw]rsvwysjoukgevdeve\nwdgepzzfwonrsxprc[oefuycfwngwkrgklo]fbckfdmwzzwfiinlfhw[mjebaresrtulcvkeb]aqxnxzpnqukspcol[hpfnupcjrkswiwlgzz]xbnwmtcsqwbpkxys\nnbaxkwtbtodcuecg[xqoetzqgjhxmuvfvnoa]edvwhehydqhhfjm[xyepeppmsepsaixyisi]txxbbqwefwuffdztlnc\naqeknneydrvnameefot[dduhtgzqtjyggmr]ausnandgijmikvgd[jjvsfofhypkfrrc]rgzmkiqggfaesoznlxl[przqmabciaxkcunhy]cnntseafxmnjldcp\nrxilrztnhgzclsgy[yaxsuppphljrtcxev]mqyqgjopdetsxzmutjk[adyfostrkvhuajndjaw]ikumnitoxctaqcpop\nntotlcdwgtsgotovhyj[wgduvgtqijgobem]hhdytbkiplykiejg[sntkfbyrzgguijtwmm]mpxnepfkhssujwhegbq[sxpsxodobizsvppqptl]uqlqlsopbfmgliw\nwbyugpjhymzlgbl[zdoddxxbnxqimlo]tyaobecgkbvrmgajpga[asriovkglwqiukcxtjk]nvjqkrzxwicfzdr[vzqasgjrafilljt]eobbqeenineqwps\nxbtwnvkwrlnwseaids[znlftryxezmidoc]suigxfrnxfzeudpi[ahlshriqmozkpiogtc]zpjiwsbdawhjynju\ndrjfebkgnrcuqyzpezw[hnweqviwyjtfrwpu]popubobnviqwkqfv[plaxjplhmhjqjmqjsh]idacejabrvhfteelbiu[hhxwpwgvjcncpjcovv]tqyykiwalnnkoniju\nfwdnjlvptzmxpwvsli[eidmcurldxszfvvhjf]bshskptweuzuqtjym[dpwmmspdxpiqidrfz]bulnlyngfaybqfinqn\nkhvidctisgemoswq[vzknkycuuvznnjkzay]rvzkmucboqomxkmtuvv\nymfxlhojyjfqvctzue[sihfpembvmdtdda]wezkljquqtkcyiar\ncgzdjkbnmhptcggqib[autoeqiibhxdief]zapmbimuvhywdtsbtm\ngilwnvmvdyftcdmvaql[esmtawtmepovyih]quztpmdplotzlszav\nsfsncarxehtgmutj[aqauaojoqabkguvan]olgokvyhpfjzyqgvbcy[fsfdkbxhstvxlkzb]ozwgbzlhrocqpjoseq\nshzexlixgxazcobmdvz[bvrebdcpytgplvii]gxdgzyoqpmkqznz[wuywofxihsgxgpcksgh]lwqsslamcrmkobn\npkjlltvbsjnfarycgf[gwkayyieahfowbrgr]ccgyjvjbdeoilsznvbi[njniljtubngiuwlil]kosrulvapzdufvq\nclhvakestwquwywsohs[ubwecsjptinhzngw]dvjcvukpkdrgpbeua[svetegijnnbtetpgfu]nfejtethkqavpol\nvksryzexymetdykenw[etxzvunetbovrwttr]pnmwnldqzmxzjldnmh[vnskreneiwajgmd]rwbeletsldocxguy[agccpaxhrlfokpt]wembexaqbprlrzg\nwrxyiatlpvvcuroguv[hfcsmxesvpwfgtpqip]jbspeicucxtbnti\ngbxyskaitzeogoej[drokshekgcpxpgktoi]ivxtocmlrugoguf\nsfzpstesdmegcuhn[drrpxmsfpcjvqerjb]jqcvoeifgceremgz[chsbisfayixexqer]qyhonslazxrkagpp\nbfufgciknfkthfbr[tlfmuebscorrclekjfx]offqunmqlcetebpov[bsbmhnbmmqmdbpnt]knkjsvpmffjqvtqpk[bryxvufxbsocwnd]hkxplkqhsymumxarn\nftafmqgtmaazvmstfq[qxsvdxplpesqzqg]yrbkrhtzaqtygxjheuo\nxqgmldfvsmitjzhbr[yrwujpzkzksxdbthk]jblnpmdcljgadym\nijtilnlhxlkhoaftet[rgzfrfsilxhwgpzx]gmdwwndlvtvvtdimd[wyghkhzahfwpaknrxiy]ekpkylqvvxypaszcozp[hjdwslazthbzhdimne]xuptxflgcjgdajfgqa\nceklxvygwnkfrqvwd[qxjqndmhxzvhicvcf]lvrzumjuaawtgviue[xdvdtoulmeaaiiuqa]xveikrwzicxctyy\npdvdkirojjubchc[iylcutkspnuquwdc]uzbtxemzazuwottv[sojezpwrsstkdwkses]laokggzzeaobwfus\nibuowtqicxqiifze[emohxvujvolopghkrgw]secpljnouzblzup[xvpvnqvnsgsnmhwdpbn]ykpvwjlhtpdjlflxvye\nbotbhhrfjqjqwdgmeu[itwjgbhzrqnnagvy]pzexftzhniligeyd[egtdkuktihxgmdd]cumzxbfgryzedtsc\ndgvuwphikpupaovhovx[nbwxxhepxfzlxcoma]vypmvuopklupuzlk[plkvxscxriyzeln]sopaaxvckgcbiahm[gpafvifmxvjouczus]uyqhgsdxkcylwle\ngufjlajgktlwahsa[kwtpvwbvjzpmpbstiyj]nqkkgajutaofdauzmfq[zihotkwlyixmfsp]fezlipznjthttsiwpj\nlqriaqvyvawemnogd[gyqqrvivtuxxbzf]xqrrsgnxbpmjsgqqr[zfwpyfwojhemhmyoajq]pyninwzcjzypmygy[qzftysfhztknzjo]zyybzurfxiolsik\niojvqxazkhdwzed[jnnntfrduoxnyqpeszj]dpeducyducrsuwa[rnfiudvklwbdbho]lklubgxkqldqalvh[ogbeiwjdaeuwjyz]cvhoaaenmeuovocvog\nkxtwtkvaixeisgzjky[cnzhhsipmfawaqzc]gjpptvjnwmbqqbuum[qryazcieexjwwsvfi]cysiabvuldrkvsxqgu[koflanzstuwaebjih]krzursoabnpundffqs\nbzqcnugxfeixhnvk[sjyuxwjdceauputr]tcjsgbmvjklijlowud[mdmuqbpupxhndvfcd]ypgdbaxwopztyqelfis[bvpphfvdscmfbhynf]vjaytjezersopuqa\nsceyeinwgkcccgn[sgxwelfgqimdwzlbj]uvyuazuplvkhpndc[etahwkowloxlylnp]hletqjpvxzicdrs[kyrfwcyoudjlueqrvr]kdqsjyoajsfenmrol\natkckckrgntchlets[tyebmdckmayofez]hryglgphkgeoswe[jeamxrrzxgyzvmuh]vcvejocdlauybbz[lnnricpcvqztoumc]uggeimsqrjnppskl\nrutaemkjlwrslmsp[jwwgmphxqlggydlsh]xdudpbdjfqtcgrw\nlwddwkagigyjsht[zpizzqoqkcbqmdqfqp]vbvigihfyemwjqusdh[kqgxbnysneqgxdwzkpp]issqguyhzmttxofz\nzzxsolnnbmerygtvvk[bhfexiwvaohrbqbadi]zdsieuxicwijamvo\nlbfovxmrghyzhfdybb[whedwghlrxnjtvqelzp]oezlanrknbaxtmo[jtrlurnbhmuymfwx]puvsiaizbjtqnot[rssajpiwyftzhoacoqh]ihmzohwlncqrfrjpbpn\nmflsnlcufwvqbhye[lslradskdqrueaxvoez]iyrdzgwbghbrctrmdt[bqgxpsiwleisnru]sjwifvnufaaedueaag\nrcdjaebyojixvatc[bjybjvqonbvdtyjwet]rnatoqmpxauyiezad[ltcfporqmmavmsjgmrb]sdiogziluykhmgcjf[bkkhyuslxlarrqbqe]zzsdsepgilymdpnhw\njikhvuzivjikuxkmlus[vsgrhafeosvtphzg]bjhxequjxbqorsnhx[pvkgxrttjofimfuq]cmrxlinhwqxhrkrdzpk[xugunnrtpxbnemj]hapjbouhnfydllttkdt\nxsvwiruapkldajmkyx[iohclbiotvabvkhkngm]qfvbpipvniprtqjj[ehcphknxkybflhn]ackdoidsuczifwx[bdbekqnxcwwskgxp]ofvzsecshsgbqll\nrnpjfqpbnpfqtlpkc[itzrqowsquwryisqywl]mrkjwermsejxwqubxwi[plxkhpuflnhspjficnt]djldgtkuzafchfwar[auijeassmbtfdsd]etfcwmifwixeffrtpco\nnkqwqvkikgnmwcnos[nmvtwkyhwtwyrrupx]emdniphxpavkede\ntkcdryrjllweves[pqdjnylpftbbktemtkl]qlykuckixcfhwuczikv\ncfjwosfrfjwgwognyjc[jiwoynoxdngalmreoq]otqvhbkwlkpqatkx[wwgwguxuzwlorap]rjuopkpuaftnkdeg\nicgtjqangadcebdax[wyosawgqnexwsdqq]ulyhqvrzrqhibudyu\nmrrdimungjnszyr[quzeqzycxcsamewykb]vqrhnvflewxwzvxwxg\naciggfsvhpeaemh[xhizavbtwzpsxdkgzdl]dbqpkvkmrbwjcle\nctxwfkazxjvguatxus[hkcjonilmmvovjawir]ruwyywhbhkrheofbpr[qeknvkabxrdgfxgrp]hymknrdlgolmqrpklal[qbkzigpdxfcgnfhdrqr]hrutorkgyzxlqlujnv\nocyqsefzuzizjllui[ttpjltsmxnkavfbviwn]ccfanejrzrghpnb[ehkgwatoncpnwfpjc]qkwynkumqgvxuslirgg[vrnprgoivxrsqlpbmke]jdygjgsfkbhrbfc\nnecmpldghpppjggvw[vtantcichlsjgrzdxlo]bihypdunzshlhxktuk[iusfpqesheojjdmk]ycztqgqrqsuifzgnqvw[oyjhytgpicigpcf]ewrixdzorbmmxgywf\ntsddziihnzqushtoeg[ldqhzxrgtfkcrhecrm]nnesvhwbrujwmon\nrdapxiunwuijmxrqf[qvekjcwvibpucemj]uidzbyozcfnpempx\nfdvouzrhnlgyemqqqa[rosijdvpwbgnxzzr]moxykttwbfixxvflpje[daadlshdcnrwftzxpjj]pgpphzgfkeapstad[rptqkhjmanvnfuj]drurgqqilijigaa\ndcdcoboftwhtitlto[qdqpbbobdncixqwhmn]cdjrukqmcdbzwji\nfsmzzqlggnjqunemec[oxrxnckqpvilfinnolv]mgpmmemxrkuonag[wsoiyculboqjnux]urwswywdpuesxaq\ngpughkygfkxahewxsip[licxlfgczxcqejs]idnuezcmwhwgryjare\nshoehgaydkpbxwshf[ksbdsdldhfsxjipf]ubrrcyykdsgnywhojya[hfjwtuughentmddwd]wjpsomayxantmltuoep\nsrpgizgochbueqgg[qeqltfdohredaspdbmy]cexowllqgvorkapnkc[kfivkiksqxospfw]naiqwxlkjowysnh\npatacqalyfmxulxxtkw[hyxkhrfewkpafeel]thgckmswuwcjgcuepp[lsfmmxuvmiyyzzxu]yiktaounkhxoqzm\nmaeefdbswszxotz[sdfwswrwotoblvzk]bqmhwlxmzvjnorn[phhhipunsmqfmormtk]aasvyeqeffypmcop\nfhpaqlgiumuampggbha[tktjydzyzgbpqosq]dpqodhygfzmbfku\niotcaohleclcmtwp[zirjcaznbsuwrbbspl]vdyhcyoroztlltnsubz[nmnaakmudmmobxzk]xjxybbzqfoibovwhr[tpzyhrmupmrfoeufsv]nfvtlfdnynqiwrmnmt\nbsadpcmsvgfxbpskka[bqcswpjvfijomiajzjv]zjzfrshleucdcwpf[ipqvielmzuykgbs]rsvzmpmpfahujfofx\nfvryaokhaacjqgah[epbqswhzewpvaip]cuveezfvkvejvvaizr[hlhatamayfeqllu]ixwqbzzaekbgxkmhzaz\nreyvoyklzltgudphp[oxjgegadnwxleogg]ljmtypolhtjwpvs\ncbihaubuoteffoyu[svxjexmihzibcqb]jzdqjhmjgugqyur\nkrpfvdsywmrzxbusjl[juomxpbfboxgvkm]brhpobarqecdmqkiwy\nwsbwcjnpzputekmilg[qhdrjrdtwqqaqsymipv]fyrpxnpnbowlhwkcwd[wcxmrmmzlznnrel]oamqtpijleztiuknf\nmmjzxbxoyrxkyvdtss[cikixrlteokbezfi]urjcocznnivoqkf[wzqgjmuuvuniccrj]eiarnnhreduakcv\nhonratmzckbtooiwan[epebkioukueaexbb]xyakukoiqfmtdhvxf\nauczawuragikjbyg[xqvricdlkrsbnmjqymq]uwinnxrbwluaanvjyvz\nrrpjxhttogyefupw[cidavmfspeeooolb]ucfrrurpkeqltglk[ulptzlfrcvniduqkc]bytebcgtpqkknxpbh\nateymyqwgrjfwemgg[xppbfkjrlnizskzttbw]genvojuvqaudosfm[psnzsxmpjtdbznh]kljgvgkdvezzljte[ovfuojewcuvcqrfdzsk]kmbgrfpjzllvrbmpimu\nmrvctdetjidibveb[msvevesuydbqwrytbh]yiliwznzilsslmachk[mqyuthyalilcmdpxz]ctawteeyyrsbncp\nxhqazvqcraogaog[efbpamcmboregjesn]vinozerwxjyrytyd[vmzmjnevhaiidnhiuw]nvzsnlixrdzmzvtgfy[veacynylxxfkeep]syokzdwmkkhirrz\nswavkosetgudxoshj[fvzlrzpjhrbnbqsccn]hlvbbqalpdfefmaxdse[ekisavmzzlowfwcmqp]hutgwyxxcqjdiso[vraskyhzrfjitpxakqa]rcljjityeqogidyb\nhidnzkzjrekzkkqqpj[qvvuzioihfbxhglu]nzlgputvbrvwrchwhzc[rimjeexwqbdnsdn]tfzbpsuttxirwszy\nwiubbpcsjjmtbnd[thcllhnafhmdojqr]viplkejozrbrwacv\njaywbjoscfdifdfalf[lvouibjhzbkxdqd]mcxggciwqqirwcyps[ztiybfroldnlieeg]vwnzbrghyfatjsxsvfl[jenhflndcjmgdojv]uyxvsnfigbtgaemccz\nuutahwebslojhtl[affybmhohxqavah]xocumtcofvavgdgl[xlypyhazihrgfwllp]ptfnqjlzbaccyoaawi\nakdzebybusompcsooz[xgymxdecspvdvkgit]dtnhtzkelcazovecig\njqajvhvbrkrynxg[yekfvwkborakrkfl]bovxzhceonjclmgecgy\nilythgztqwpxktjrpf[igwywudlvdqpqbu]hxmvjverypjvjtk\ndbkmmuymxedkowpcws[kxtthcqfurgkuxxx]vkypnrqtmhlsqogt[rtixamexlrydluvxe]nbehtyxipwgvefctyaf[cxtipjkxixrgawvomc]ssvdpknocgugwjxpzpf\nfidyxymrgwqpntyg[loqqjfrzmidkxskyfsa]mqilmzklkzhzedf[mitpmedchdhhzxdqpl]roerrhbijrjwmsm[quhrsmqqujwufnm]layxublhkfpoykadvcr\nnjsjelrfstonstmhq[crcgsmvxndyvyfsjku]yvyrpgjnuimkxcutgvh[gwmbqumupsdfrusp]sbedcqptxzhsohroth[wudivolpxauvxvxbpqk]bnfygsxxzqwxumonnm\nivtobvcmwywqtjkfa[tcfyhhgftbsswpnvbtv]bkuulyhtihhqcckjo[lgnkduoojrzyjhby]uwkeujommiprdopgche\nmzrhrvpuyolqlku[rlofuuumtasfuknrasa]tfhglvunxtkafazyehj[hrnjrlpyjntwosogwti]ixtpihfavwqkjnlipmm\njzhfwqxoqsgnrnex[ccrtrnroigtbvrnjeji]bbhfsodufjqhjvplii[mcubmtdgwttmmnazhpt]hovifldmlnbzrwqicaz\nhcchhpmerpjppsj[wftljcxoqwtoclz]xihvvfjfhefdkeip[abdthspjojqvwxx]fhffpflinospcczm\nvupulseekbaiaoempu[zupmjydxyobqbfmy]xkyopqxvogwcpuwnud[orgnovcpbpqecljkaq]sdvcakqwdmgydeeup\nwruccyxbyiexpnka[iirsbfvggokpwli]gztvpqcsckeaiqofwf[zdloxqdlcazkhkppz]jydaafpuoznegyif\nlwxqnbbzjlckuji[bzxykmlhlgjosvs]fdocjjmtlhlghzvj[snveavqbuhnzqktmyur]xcoabwwqxexqzakbrh[iqkdvngcdtlhlhudqk]edydfxflcnpzrcjsppt\neokcsyiozfqhcbzffj[uiczyrevovzcgvu]mniuhovkpklhedhx[gbyzowvpnxpemkcrccc]avfhgxxldgtjxuy\nrxjbmcovdnxoxrjter[ijiplhrlromkesgs]xwtfawphuvrjimntwvs\nuuwjtmgqskgrxrlzt[nqzvntwfmxeptqylma]gbahtqxvunohprsd[strhrrwmxsuoiuvi]nhamfjzlocoufnwbgu[osdxgghdsdkbqcpj]ywmalngfjbjymkz\nvsmcjtzwfubhlop[ttbkmxwjonmuscwi]ikjuxrmqhqldtfzqa\noqhkopaodmimgikwcg[biimzvsoczaxfdy]bkcbjbcusyhdpfo[vfnzlymbwetzhbcxz]zyntiiipnkmsjjemxq\nhzaeznnipwioicdfa[lperfrgxekbntipyf]mnerflshwywujfsp[nrkcmayjxnxbhuvo]mdxovxksmxlwvkbrdf\ncuqqyiwojnwvbybcps[bujmpcuovhebtztm]bektaixvzjpofzb[egiiqzxqdlfwoukjyiw]nqkjlpwevuxeognpnq\nryxoyvavwharlbwzeq[rphqbmnaiykgafsftjs]ijrqxkvnqersvvryz[mevoiitcztvfztorohn]hkchrvkqswjpyay[staoxhiuifnbmxuytlc]fuawdkujedmkpeto\ncaowivzceqsclbyp[grpcqqthiebrabqwhxv]bzmazhewqmbuhjokm\nuhrtxyxnakvjydnroc[fhnjxathwyyxszmo]zzukeuqdhxravrs[zqcltmosvkqcekap]gjartckwucksqzcn[smddsrvnfxqjxya]gkumdkzqxcqxfyhm\nldzhaqlkbxfagur[qvlstlwnkzbmxlxw]reflsfhdsosjaaesps[qajtodlxlfrbdlj]bxytsckpxumuoklw\nghjjrxtnytqatjfxwt[opmvopscrillueslb]zsxtxstrwnyzolxk[lyeeidvaghynwkckr]shhkellgnhsuekrzoc\nvpliqrfetzttovx[nkmmjlsskjhnyxh]ayockmlevegaseq[auzorvghfdfuuajnt]poknhujvpctqrrycfun\nvzgpmpjvlzbhzhlexp[zheyfmgekvhjsnmosaq]krmficowypbxwbztrn[rvoedtkjlfpxtaot]rxwejzlarsgdlayv\njfrznpvhlbchvre[obxfauzcchgnzksp]fgimlwasdrgqvquis[ewaqnfexmitmuxhqnp]graisawghismkouwfv\nnqmcashwuluyxaxcw[fdqovhbtwijgklubmon]dgxewefrjkhrylq[maeguvhvptbgmjdwhxb]dkdmdobhsbyforzmqr\nhuwexxqnjlofulknxz[qnbpzxlpdlsqrti]sbmmwvryxqsrfzpm[ucizjfqroaflnixzbpr]ndztjtaeahzmkyords\nmwlrbdybkjhgorutus[bmbedqpcsxwkganh]ttwjrjrvxsikepdbvgs[qycnjzrbeiiplxarls]atrevpowofauioaof[nlhyhaoljptrowlmyo]hmeaxvwasyaszlgq\ntqsmjetgtzmxfgakjqs[cbnxrpnckgcndpcwiae]uavavaewuucokfrm[viufzfvvuiuuehyxcw]nkskrloinkwsoukw\nroximfsrbnzyzjmn[bqugwcdliqyzyaqiupv]rpdidncsfgexyncbg[amzmtmqwzipkjfy]fqnscfsjmxjlpoccvfd[bpebfxoinyaqsgjpb]dykidfsbcykdobqe\nrcmbmjwgmwathepxunw[uoieoiytmrywrjevift]ourmrqqatqnwmrisyu[bxodgsozbekrcuwf]gkaigbulsjxysdiawg[kczakejsrndvzdirs]ggjgbhegtgijrdz\nxtksmozdsgsclsxrfh[afxjsmsjpuqnomb]onqkiyrogyrkykxjr[bhvnrdaenimevcx]snufewjwvfqkafjjzn[cquvjkzxpbfbghmnpwi]wjbdkkloxxgsgnmriw\ndoruvpwqkvibnww[uslnnvqcrwjlexech]cshujlmmujfjdtjw[pkbasqruzspzipwrqke]yypbzzqwoasgldn\naoxxznvrxfhzwyyq[byxxvystyyrlzvl]jnilbnasrzvgbbhrl\nwvtujbbebuyuazangzc[moooepbzqolouuyxij]vhqrubkyyuypknfh[gvfucxhufyyjefei]axvrkaeaqlxxfip[fiazyighxscxhiwydc]acvifmzzltvluos\nyzyfibzwjuddaoxc[gpjgkmckxctlttgcdcm]rmjohduchcituck[noozqqxrakiadwu]mipigxbhlbtngtpcpz\nzipobscyynjrecng[jeekozoaoyuuqmroisx]tgffoyomlggbyjnnv[mcfybdsenqhygjo]dnzrpghyroqbcje[aoapyvfyscqfzhihddf]vplszbvbycwxqrhb\ngcoyyfxpuufglqfsczx[ebjwlqjgtgkqdeike]xtuuxrrbgiwhwqdcyw\nmdwjuxoulckloxfujkj[omieaeznetsnkeoroh]ggnwbuenkgeujmap[ghrtxfonaxyhfogpjub]ptyopzxhctssbwlpwy[xmpglsqcnihwzgbgm]yqmqddmugnlrbnqkgci\nxeayvddumafiomemh[euwluehznzxvpmzbz]fxcevhwksvwhrvzid[maotzdveeldpyetguj]cixjfwlbbbrrqmnoklo\nlarctxbpbdnbpqyyz[vzooyuwrgpgtjtq]sgizsbcjteinyxto[jbqzsxejwwgrpcgzwrj]bpwcfwyglhtuxqmy\nzbxohuvlboydqvqhhkd[wgcjvlrppivpnxifvk]kmpdiwdtpmrctyhy[pprsqaqxunduprjnjxx]zfbqlbdpmcgfwenem\nghcjhgkmyfejmua[mqsuukbcdvjmdnz]ixxelnebxjrtrdwzlkd[ikojyewznghqksregl]tkthqugytcsdudoggp\nhdfwyjganjbjhbjvswz[bfaxlkjfrkakeedg]zrkxyzbozmchfqgz\ninmdmdyssqhykuhn[vbjasprzyxaphygdg]ucbbhyvlsjjdqri\nzdyejivfbywyaaqljp[sxmtwgwmwbqelhsg]jesgfubnghtsagcu[tofvxzmzzsnywhbx]ibnbzcdhusdiqhgika[sipfigjsngidlzxxneq]bljavpomkpqzrsuuo\nuahcmotfanpvzru[opmqbnngxtudnuyc]lsvafzhwwwmoagl[kzpffwsffxozirgyz]lsbjnbzflbiprwuvurf\nrzietxnbixgvzxnmzlj[iygcirkrgwwsgpcidzr]bfrwgfeyyatmalyjsl[dweehclvlbefvlcp]qurpnzinmyweipshzs[lgbfgdjhddmtvbzxu]ppxtzzkiizoqqguct\nzfsvifntrvbjgdcuc[jjwqwhifqbxeqkbigcl]fmyuetebsksddti[hmopwdnxvmqwqflr]jidndiejmzoutjpkdm\nqwnlstjkluchubgkttm[yyndjrkhfqrxuyglebo]xdltobqidrkstozk[shmmslerstluurc]fxkrzqnfjoalxcmssq[bjenpehkwbxpktb]eaallvedtajrnupomva\nzxqdqrztephcpieqdi[rigecfyegojksvjmya]rgygzpdzmpvogeurni[odgdyrqmqgrcmhfcu]ggdgejoiritcrdxxu\nezhzkozgllmnompn[sqyilkceizeygqkwot]pdkuklrqdgtgoqap[yvadgqlkffoklshvf]hkgwcnlbadpbiuzvkaz[oozjtyzsxujalkwoo]dhntuiangtulscbzg\nzvwmdxzivmtzpkmhnp[qduttqlbrhetmuj]vmykluzepgxxilmn[qgswpbooccvoxlg]ujndjzfubkxmvvdib[yrneuetnuktitut]vvwnzxosnenywomkyj\nphuncbfvyiwxfour[oauntpjxaqvwvqn]liffvpoxrbljogpcwvw\nusabjelvalpgdyiyn[hywbrqfeqwkizwnxf]ebpcgxloqmzflbeag[dxifrjggqwzokner]ndwzylxxlkdcpbk[kfergfdezgbceby]uscylihvxfbetfnog\nafgmwhqdwessspzx[ssbmbckihwjmiaw]zbbiktbhykmehed\nhforuldqhrolhqsm[gofgjhapikxnhhdn]xgdarfanlnonwdielb[hvntptxixclnlqphvq]hvvdpsmvsveyaiubt[hiiscphavjogadmj]bbfjdjeecrhhrspxdpq\ndjtyronibzvtixf[yvofthnckundxfe]eccattkkitxyotbziy[afdaacfefrerytfh]cquizrjfjtqgjozagid[xkbcgazeolbliwp]hukcarrfnjctdycpfb\negwoebxchfxxlrr[hxugiprrlfwmknw]cpmfgzxzakyhumd[evzzvvtjwwzwzywvk]lwcfpjlcgrbjszjvf\nhktuhumsttqsgfltrdv[rctkgluikouomerrv]jblnggtkdhveufixx\nejjzogefxwuyadzthjb[ibrhegtzukygkfnziwt]utcbeamzzfkbrmqonlu[yofpkwiuewvtbswaet]zxkgoommtfxezcfcweb\nwbauuixpbtjnuos[ozwhlzidaubnfiuiqa]nlkdtbovsytnvjz[ztfjpnzvymrefnt]nixbxdoogrxdvuxbxbr\nxadpfckydqkmbvbj[vwdzgyfbjlyslafrp]mbozdmkfztxwailiuv[uttdatknprbzvjvucxh]cqcbkumzxiaqweqfiry\nbsdbnkvvlwpezlhc[cdzdiuewblcmciggdgp]halpvjdbnpbdrnkz[ikoyxulwagjnwego]twyvbkffqxasqbomi[ajwtpvliyyssqjex]cfbqtoqqlggpufbfx\nqoqtovwkavyaqbkwmd[vxuqdoobfxtanlwd]zklibywcjpksseelw[roqxvvoifjmxnarqvt]zeijltexwykdvpd\nobkgwgtfxwjfrepg[slekjheburvgrunuaxf]cnhsvevmitpuwokwee\nflulgpwvsikwhpzpza[pmlcfhtmvuiyoidfbfh]czcxxurdakbxizbbfb[blpwjusbzbdwugwbcv]vltmmzttxuhooid[hlbpbqjpqyclebkye]hgozvhgdplllxiio\noupstawbevsasbhv[ddvybaqnhfckfvdgabz]nooqiufueyoflccqzc[jyljuydjddholsx]bbejlommzienlhz[mpbmppjwfqrgucxdqxx]sjohlscgjoprsqt\naugjtgfyoatluixgc[atdsbsouunywohfnk]dpghgakdvfscbapsm[nkodybopavlbeikalqj]myhpkcbsbkbjfgj\nwhzlsgvuspnzdunurbg[cypfmgrkqjeppudbdy]civtfkixnmrkqmchhg[ypyakrsygkyvmfmmyf]blihjslfkbrysntsl\nxeyyjiqvduxcflt[xiqxiqeepbpkkydtzxs]vbpbdsaivyavnfwj[rduzjulshqiluheud]inliammiyxregzbsrkt\ntxvixsvhvmxxsomvo[hgdskyjskapgvyiqzsz]shvhmfrbpxbndsx[plvytalszauhmpkr]jyujmokrvxwmanzbxbi[mefmngrdhatojkpplcv]dttxfesvavgpkbtpri\npproajkxqwedocrc[muhbyboayoghprmbtxs]odroemzznotffsaxsmg[ykfnecchdltzosnyby]nozuvokzntxrnitq\nrqimalibychumvzdq[siqhwfjimixscjmne]hkvxsavgjvpzkyay[nzbxnmxgmyuwcywvd]qkuzrfifsyvonaalxu\nrymadifucrlickzorqr[phxxuxpffvnjgofl]zqfbhfmzbvhbmask\ngzuklpopfcjdrxoekz[lwviuuoyojzggqjs]cyacdnvkgqqafcyprae[iyazavdiashvzwpgip]sztafbunqsyjtpz[fkwjsbllccbrrdpa]dijejdfyzqycvrdkl\nnhmayligrdtlvyeo[laulduejrclodvnaoh]frxoepqtmqdzwwupiy\nexzcpmjdjiagpvsvin[aontczoixbznfwsvss]hdlmrrdtbumlfvril[gcuizdwjbzyhttw]apadljkbcsylwgekv\npujkeovpnvnleypqz[ecxuhbtnrlnzojsxs]eyolbkoatzbwvnvwxlx\noefowwmlhqytnxaec[rdbjjilbmiazndcycr]dvjwgldyxfrzicw[fxpbshhafqifvyju]ygagsxtxwnsphgzqrpv\nlhbebfasigqbhndgsux[drchunjaqzkcmefjys]nzloazwftxoemnmifox[gjpmyydbftxggnggadd]onlcnitfjniiekbiaz[swjdwdaikyykupgyg]ltwxeordcvjfarrhx\nukvzfltucnovohjidr[apslrphaneessxbpdx]cxrovjkruohahxshazw\nxnsrwrjioindnxhxrrn[mvuraryghmwxppnlp]mconcxeyryuvfqcoy\nopafehetqedyikso[vjnjwsjlbiknomzuu]pjurldelcuxkdlhehm\nkvpcbopojkvzykdhm[ldleeqmztdnrohjm]vejwyvzvekairyhc\nyrbrakwltaduyge[qwvsxbxwiretxirlsbt]hdnwansdelcvxptiou[uhibherodkibtww]aphfcrfnpewbrblyme[lfwjpxyosiappsd]rshmipxgjvorazj\ntsymbomuywfpmdul[wgulyfhhwodplfi]xixmazxgewasngsv\nktywwprbuvuhmnpwfoa[fcuicnujrweusdoe]fuarbahbvkhqjibcfp\nsnhkrkibygzndryeblm[pykdztwnxrawqbevu]wwiwrwfcwtirdkjh\nxhomjlsunzjzgkxc[qyxzsooayiqnuzljj]jftgbnqtumwipywdfrp\nmhfgzwlocsrhbfkdbud[kwtnglxzzdwqcfw]ezvrdgdyjjqfwuv[abznvdwgiisyqjxvu]khcfgchqbgwflioa[upibqontzrahabnpi]tgjaagwvmqewmfyer\nyfptdfhnebzhgpzism[tglibrfrnpfmydwbea]mmoqveuvvenorhnrw\nljztcdworsemcoe[yloilpxuumxdzzxl]dyawqaacdnjlttcz[dxyytbozmlibkocr]dxpindavjlezzpogz\nbwkhzerttqexrgoea[ubnuzbvktcxsxednmu]zqjpbtbzdcfmidopdy[malphrsrebpeeuw]vwdlaafkntcaqmwjqc[abciktgfeaiptay]yqksuqwsuqtckkoyh\nfilqrpdsqqfgkcu[obiciozcvbatglnx]sjzgtjuddnazrzfcju[svrswvhpfraptqsxolt]nfcphmwaudhrnxkzc[ysohuzukkfqlskgkd]nynxljuswasofiaarc\ndesdobciyiqsycj[wzvqcbwfbneahei]svofzhyvvsrwasvvg[igvhymbudpcrdgjwv]qtyrjtghnbbtekl\nfygnlyiuxapyciwwnbw[fhwxcrwprlaoiybnkbe]fxvtiehvhfgfwtsdfh[mreawqbzyvkbcnkyftm]rryknthocegscrdtbcw[ktbeedxfulszfogwnqi]kqwtzaemzwmsloi\nzxroedxtywemimrje[fvzlxeqgczajhimr]lrhvziwtgglifto[buxquosscraxroklx]pryldzimioibwliygt[yvmeeklmyokbgexl]oqezpvcwnctcbskefas\ndcowzgprrgvczwfx[zminxdmdflugwkkkk]vfoltgijbqlhjdohr\nvtrfdkwipegmqbwrvo[kshaxjtaiuyicufl]zfkbjdxhihqmtjco\ndjidszgreaxdweqjk[rdjzkbmqtyolitmqhf]plltubpvwojnccsygfy[mewadohjaliobsdwezu]vmrkkqgbtfmwemn[erlreifagjhqavlxxh]yplrasxtqcyowlci\nctautcpnnufupce[qtydhgcjjqofrfay]lfahmjfjyppehyp[qzaxqkpopvwzqofe]rkcqkjpgptshvoucer[qmczzorygyrwbxiji]zljzfavjmwawfrfr\nmwmkedorswoukdumznq[hdujfmdkyiznceknql]wgvbskjuuwmwrsvca\nsdvjnkxypkzbwaam[jrjyjxcfvipcsfv]hqpkybfiuthhszpey[cxzhyjyccoulowr]bwjcdjlwidvcfkguaud\nwfvvroenfriclccedd[aqkoeakjbakjprhnj]ytucldefderfpqaibsn[gjukmqtaxbygrygukiy]xfreqhtftbfsvsjstda\ngmqthnogaadlkycgrv[qrgjpxucfcnthziuqmc]fqlchcfytukeoho\nmuwfuurxmlzrcgij[ifojpmgnfufvhbmmeu]ezcruchallsnspos[bwlnhfxtqvwcdjo]lnfuojduqnrbdyk[jhfihfozzosipwsyk]akukjehglqpancmiy\nultbxqkpivdepjvze[flhbwrxncynirgxwt]twqbnqiaivfwlqorpa\nizvobuuojtimkzlsak[moodohlaudrwsto]cxjybpccizkmeau[dqaajcusqoaatpbojuh]pxlzqhwqdgetmjcm[jmjesiihxrtbmgwkcck]ywajslefzjxwyfivv\nymymmfpvyiyegjw[auyhltgyvzodazgd]twjkvzwomymmrhfthwc\nromqbwenzvevhyq[ewpxvrduvqewryaoct]wxgowmsdxrxjnyj[obazseiipwfmbyxhkdv]gjalmcoqrquvdnmzacu[abzkksqdcduhkizuzxs]uzuazfdegdfqjmmr\nfrvysxhaafihjpza[uuwayzhynhgliyxcc]vdcjfobjuqddqibjef[iusgoufujvqkfjt]cejktzeuphymtswrxj[nthrscqmjniokzsq]tnsfuflhwdkvsrlm\nrrybzahzqjlsnrf[aexlsirbdpwkrfhms]ftuaymthroqwnjlhwv[gugocacufksbdyqsfwn]ptivpdoxkvpbwaohlfr\nikdnaifadlcqtyfpq[ftwtatuewtwyxevw]klpnngjlhfuuwykwbqh\njcjepxytivozlscfk[pdosptbukdrtforgvxk]wdghlnuxqjdaztviyiz[mqtajavotnicuxco]vovuvrvnwoedhflabai\nyaiokdeleeowglfd[qzhtllekpxcjvig]ohtsvsylelaafkxk\nqkopuespenokczipnz[qmncizyvbxioknj]piygfwazneqkamiq[oebzwpkixhbywqc]tglnlkwhricqqzzbkuo[azpshyiwubdevjojg]fqlqjwtirppkilhplu\nwpjdzojjjgthuvhs[ttvkvkootolwcilow]lvilrilboatpxwa\nsqcunkrlvqeapsseomh[hcaleossxxtjalzts]dwokbxvvtiocokk[ziimvyrfcpcagbchp]lqsdomcpacsejdzcxw[tpekrtncgabhvirc]nqguzphabzalcgqjbmw\nlchsqkntfaymwss[glcnjoqtmlubbldwxb]repxhlvahfruswno\ngvwpylwrbvedenl[bsexdkrwujurnrhirju]eskvbigiwdmjthvhrw\nuumyugkrepjyfna[clcqpswhmttsgtrnh]wnfqshojhbnuvkblcjh\nhcwvxdxtuptlajr[svvedookmmgybok]dgfqpjqcewcjwqcw[rtkptmdbzfeqcyiha]xjnmaukpdrlznfxvfl[phdpcpgmzzlbeplqeyp]xfxopckbwdpteui\nmxlmvngjychkbdad[nprwbbiggpyhrgjnox]kkkrpnnokeecsxwtfp[mscljzerlkqzmxsghg]mvwiwebrwurrppqw\nbdgrunylqufybegh[hwkqigrllagcnatuzqe]tfooqltcwxznzoaot[hvdskwgtazfkqlbbbk]zlqphymjvcvgybaxo[uvougcsxvyieite]lryismkbwdzxmprwjmu\nmtrggduulofkvbdmqj[oijictmaujkaxedjfm]kvriyuoautahkfmt\nljywcelytwxtjojhn[iopmxuupcuvfcgubem]alcwlvcmjgwoksp\nybgcqoheatckeypwgq[szypqmipvcfzxbl]obblmhvzjoiinqd[kvoyilelwmylaezhow]fforcawucbchzbjlrmu\ntxgcosxcdgywyfhgjm[etzfxsiksioqtrir]czbkwziihsrtlceuaj[ksksgvozuazlcgqcy]tcottzfkvhsmrsyvf\niggzhhbedhayxftelth[qznllaqmnrogfmdtbx]ualmvsfjwntzbzd\ndfeuwphubioymbzuwo[tucongmmrqerhidwq]tjzrtrfhgixyspdsl[tygroajgdzxudheh]oumnugqbzgyilbrth[ejcdurppfugoluctx]rtxzchnbmwvfewg\nkyzwhtfybawdrjkvoyl[fzrhzpdsmtmmmvuu]fgbiqggdekddtlpzvzh\nirtlqtjyzstyynjfjt[zrlqdodytcoqczaib]brhvezqcuycqmta[uaofbaluqnucifngqd]eeprilhhysftrhp[zmdzijhtuxhysuaye]bqokznpdffiubikgf\nnsrehcsbptmpdeskqi[rpcpoctimqyccgnpnfp]peakqjqlahqkqfgoc[irckfbpvcdodsmwm]oxnqnxhwmwflazjv\niuanxnzepawwipojp[bzoxbyrugitmuiutg]wtsagitdstugmsssbc[dvxwzoncffczplwcaw]gifhatzuqdvuwnupmja[wncssuyvhyawbmfpbdv]faluhtnnnvuiwbbudh\nfpedlxzxifcuqmvxm[vrfcejeyfkhegliplkr]giqaenxejvscrlxbg[qctzkslosctnoamy]qyjmeunfiiuoxsid[xpbjwjejckcavehej]txgqklgnzqdtimmiqwc\niwkrzpmhsunofgrddx[ecssnqrcjyhmsfh]yrmuqswzgcbxnaa\nlacpahmmufjghzen[zkbpbownspfqxnclzk]yjnyyjnabyhsrggji\nvgxbpddjqotuvzbakan[vnagjxrcehlhbxwdw]kxuenaclhrihntgwjq[bgqywyrrhjzjqdnu]eirujssxedivdmvlsby\ntsqxgzovbjzlwpcbv[rgaywjaothmsswcdrtp]owwnjohtsgegsgtah\nxzxejmuyfhjmgoxfl[hyafuepnewepjpy]lbdbsoxevfzdpnwpfk\nmoucalsxxvhjiyoceol[gwxofnqdrtxzusk]qjosxisditclyvucbm\nbjgdyrlrhtkbqrjohwj[gcmcelqjvjadxqnj]tlupekhzidsrscrf[oqadjqqatohbjwxrneo]ykhccsunlyamcmmk\nvgihvcltopalggrjzsv[hmrksbhlxuzvtbnuss]yqpcbwauqeduyse[oojtsldylgtokmdwsy]intpovuqazkybvjim[qbqspjlovnizurecdj]fkxluehqgdogxdofnq\nmhwhttcwzcntsbufi[afretswhwxhwkptb]srrajfoeahmhecarmu[wgjragqlbpfbfpd]epytkbjxmblfnkwhlhe\ndgpphmjzkoobitcjyoo[nzkzbsfktzftpmgwdcd]nbezurwvzkhwskfq\nepuokjzxtxphttxtkz[xcyaposdqcfkcxhncz]hcupnojktsvxrfwlyv\nxfoshshomwdgssxla[uhshvhbfofuhdsqk]zbzynuiyfagqpemuplr\nhycladrjbjuyieejeg[ajsfbpoakutelvhdak]hjejfrmmzslupsepozu\nksputfunecibpffwovl[xteycruesicuhzai]sqpunyzatnromjeq[xlzamstzzisboayh]gzlnqcjacsbkkmgzi[aonbwutxuesczgwnr]aflrcbdkkgoyumfakb\ngjgmaueywnbqdvgf[tpheftnkpnlyujv]tvnqzdugoyjybxfpx[lnhefqkhesyicqqgvai]dvdgtlsayhtscupgikg[fyjgjzcrucldwdd]ohlycgvvdatuyvduhuo\nemkefdmyurledfdd[dxzytfxcsdxgjcwxjzb]rqwwzvnosuhkcplv\nfpmhvozxaaxsyxcpx[yohzimahvewgvzucn]ztkenzkvcryyrmo[drnglpsvnlefqhx]clawabytpjiwgqflfbv[xvqqglnkzkxlevq]dhpydxfqbclvcjtdcn\nitvuciuufdkcgdqgo[mgwnpeydayczlvjegm]jyrwfakomakilgvhd[mslududkqwtcsojaosn]dssdnwxzapuchnxz\ntwopcscmaiqhzsepel[qhydrqfqwvjjvinlq]tfmaoxgmccymtrbecjk[zkuwqiccdgoubccjoc]pepwccwqlxzlvuhb\ndingttjebuuxtxrxt[jmgffmivzzxvgvefk]bqxyaoqiukfungsvu[sidxinaokekzqpqz]hekuuswyvznavhuvk[lnmhqeaujpofmdzub]vcufrufbmgwvdwksqn\nmlgkvlqtkpwzcjbrr[yzhdcawedycuwdw]ncjgthabbqmeuji\noqybrhgapxiiaxihexa[gerjxleappelousidd]dblyflqmoarwpne[enariawxfzzpeqdvj]lgjzpkhkrumhvap[rtcetzkiztcmyyjzs]adjuxkqsxrlyjgf\nhqxmuovloocgcgjlajv[hjbhghstuvarcwhfy]wldxggmqrrhiwdc\nyelxlqwqeiqqwwaitp[uservmlohjixnqtl]cocskteueenenkfmy[ehpleyhokmlzslrdlh]lyvwccjeqrqiofplw[pcsjxogpwmbhrpvvn]ncmxjsoxflyiderh\nznmujbypnozpjpkqii[iydnrowiwhgazihmxxp]lvehdleutcqbwwan\nlympkckqyhgbaumc[oodkeqjyhckceptyqui]ejkkqbitfscazcx\nsxvzcdelbmcqawvour[jgrjmuzvknqddwawl]cfdxxgxsviiyckx\nnrsjamicxprsigw[iywcxzvebsemowpdmn]tbmisagklgwliuuin[ztbbbdtyfonwumpl]cjmddkvsaxzaszisyy\ntllvdxtvmesnmauwk[qaomhmguwvmsjbwrwz]gvzyhjymfhmheexe\njqiffwykdbqbfcz[nzzfstvzsrtshctbwt]uazcksxgiyuwlkbde[nvsnfriumhwznjfdual]beqjfgyanriagjl[mkwaqdkmtnrzfpszb]mrqgyvqvyqabnugoc\nkyvjsbdoorblnmy[wxackciwbnwvsggfoxe]pbufyorljghrayitwnf[orktaokqgpeenjyk]xdldvupmoyqwylb[aljdjuvxqagigdbti]erzojwkjcoxvuztbqw\nzuceocflmwjxczrua[gpdqtptmhzmrumm]lvmswwevpotdyrrztzl[pkzxcpcqxpbfmznn]zoaxhfddhvfzxmdreww[roilsmnfdmogsvyyr]inqfvvkesrzgzwsnwya\nlihowzmdtujxkokt[czwvzrilryxqxqm]appqwnbyvtxjysxkh[wpjuzvceldxgvsx]hkyptytryliycwhpbkk\nccyquivxwnsmzvurzl[gatwkzfmiuzvlxqqyy]twruqhcerhppziydvey\nkfmpvuwkfbczuahpr[uhtwcsydtbjjfcyu]mltkvudoyovjipwmptv\nyzuinluayrwqgezu[qbeujtuehlcqhbz]qwvclzkjxuficbgqv[qrzlculckkjhunba]gemnanesaovxzxatvm\nytnrkypitsppgols[boldlbadecdiaeyp]miwxcsnjabbmlfz[nmfvanenygvwqmgpiei]dqwnubvfbwzdptj[ormimocwondmsyrk]eptdchejhezxzpqimj\nbpvimxocqygiyfak[kocimiojschpxlmlbh]oeohxkrlnaramquwz[mvodjkrtgwsyshboxo]jmxqxvydlieugen[qsqvwfzcowdvxzeflfz]eoysyaomzucvprpm\nuhanxfxnxmoedczj[pjqlsouqdhqhforcuk]wgqlbagmjmtimaewh[qlnvfdicashjzjjmmwe]wrtbmpniixypmei[hnikhifbzacymvga]cueedmtiokuuauro\nrmwtcdtidmhhqvlooj[ibfeikfmamtpxld]tvqxdwcislwdijaa[znpzxccexnnkerzseb]cvyteeonwbckvkmw\nxtrkdnwsvlqfpzb[fyqeealbxbpjxohdssv]eomkcxpzhdzzchmg[rszbjedcqvxmotecne]arebcunvopesercpsif\nwpmgxfiikbeczkih[cjfseyjqbnprrzrc]vmofgvrwxiitjsy[cdbplfeqqrpvyoguuqp]gicntinbexxdcom[bhrrykkursqvyepyy]lhpnuchjkxczxxvqp\nqnaldysjxpygshfd[ggbsrjqdcbppktpfk]rfapyzecbxeoluhop[njlupwxmsxpopefrwl]xhmjoasimqrdlgjwm\nacajjiclnscuxdsyxv[axykpgkepnjhrhfgqvr]slbbdyluiqetchbrhrm\nryolywtcfhaxzpu[cihbqzqvoqwayjwqtx]cpnraqtbqozlcrvoxn[ippcsfxvbyrodbacgmg]gfmqhdjmgnfisex\netevnoklfebubfa[kjvpcomfcdacfhthi]nfqsxiilqrwqianlsex[ugqfrpggyrmumjf]utvcyluzwmzjygnta\ntvqkpekrujjfpzlot[kgoaglxyitdkwjmf]mlihujxyrtwfmzup\nktqkqvqxohypotivf[nsytklzqsdqgtjsrved]beidsrlrqlaaykv[bhalrlzjhvbdtjcmig]awjesirwjnmfjdslc\naxgwliaxadkosbsp[hpschybkdbrmhmm]sslipdgrubjiifxzze[sptnagunoyiasvcunvg]fywdxjoeyzvwrpinmf\nrhpxrkwvbmiuoks[ynxkvorcjpyldmigt]juvdfreyownzxciopxa\nqlmnvnzbswfkadrm[gvgyozcjgthimuxze]ewpsviwopsrqszjq[odmqbtcagnixpgasn]cywfvmbtfcixzjmyue[ekxllezjdqxkqfxkflf]smxhvcoojkrwvuiv\nmrjroyadyadcyppfliq[xunpwmmutvwiewlkyye]ppcjwembftkaakdig[fycllhoijmljdas]ghnbcqzccvagpgplb[eafwmpftuwwwoln]qbxjdgsbyahqkxqzrlv\nfzfcqlltfzjujqeym[jeaiiecptdpgfsfccuc]sfsekysmcjtdxjc\njjynfbiotihgcbrojww[vrxthptqnzbjegjxzru]yethaiycpixaqfb[bplbbjoveuznxlgvooa]izorgiwsvfgporxo[lnktkblkgpenjuqu]hsizqsxbuadccikdw\nqgqbnxfvfobowmipa[pgiycstlgkcvsbi]nuvfvhbouoykamjuttp\nevroxuhzulkndbn[lfllzavhyovpvvcvg]kihcrzllseowjwezs[vpvpwqtlbykudupl]qrmhrwziizlifhb\nzgnewkpulzskmghubbx[matncbjczcjofajeilk]gimvlsfgxcdovxelxsu\nzgznxyobzrrgfnipxlx[gsazrixylwsicyquamn]isxlagxgkbtgrbjknn[qxjewpiicycnpta]tghqdldoiwdennnuha[wpwsawddkuxonmxv]bmkekmujdpmibjrg\ngeeoheswegiuwrrmii[hbthbiwayyxkftmbayn]olgnlfwlixhqjgjvgsr\ncrxkwxwfcdjitekzrdm[duvbsycafjsvivy]ysrnkudiueyakhpydv[totferyeflbkxuz]nyrvffrgktfpmwsmaig\nshfruolertwzhwvfv[oaeslwnysponjvpne]lzvqqieleintnev[jdhnbbkdwzksbijpsle]svtrwqftbwtkzzixrlf[wzxzoplqpcybbhhfz]klsezcnzpvgvbxqeedp\nrodljmmftzgdnxxcufa[jgqmtuwqkermnrimyb]uouynscrkxdkjhrz[hpihpdzqgzcmawkdsw]dlvcgdmdmupcmuduu[xyjvfzjaypcbbeettvr]pnqhcmdgguswinpxmqo\nyrcxqglagiyyhpt[fudlgwwllpsimkfp]esvhuezhtkwulzmut\nqwiwjsxdiblovdjx[evezbqlggluydkth]xtoftegxpmgjsgn[dygxbbfgcnrlaebugya]jvcmiigduerloizkyzq[oyfqcvstibjtqcknk]sdykrdksunkdurm\nmlublposwxvdmcasb[mmvoctlqinqyogj]lblnmvdegbddxjuuij[vlkyfhcwrywyksv]epprdwoppwnazhbfxs\nxidpschespoxuwka[lifyliiagwhtynahwr]mophvutwbflkblhzp[ngfdfvwwlfuyujsy]pqgdfdrrwonjcsxyb[txlrkdplwmwanoxhveq]sirdziimdysnzdrzt\nkhglmzmqqlgtsoyuyk[ckwowqtfatmitmx]cqsnmpgwitnlycvr[hcjwrehoqrluifbx]dvorwhvznwutwctl\nlsjtzcpwlhruhcyvu[ppankbohskraacy]xriyjykeufmypvpcg[khfkqffqnnzsskbvi]exldjyjnsnxqgfxg\ncwilddndcerivvgcot[pwnjzedgzbwjhwdngiv]budzscutbkzehgi[swgapyqpuwuqitke]aihrettehkbulnndniz[ladvxuqplmfxnwm]zovkncitewbtnxao\nnwkbypvbwxrhjccd[tzjkzmgvioaqorgsan]bghmwniqqnnugulkcq[devmzttwdxjayueapxz]pigrhvuthflwfvyghl\nzxoysnouzggrhhygrn[wvovlnwttrpgnub]tflqcvvfrhwiikpfp[fmvlpmktaybiodqon]sawjgpmqugnvancar\nsfhshdpjhpscqgmcx[elzcuconpnmipksf]qebfhzrzjddpkrwy[mtpfmfwynqlzlcavdjx]olgxbalbprtdnjl\nribazjlrsqqorxkipi[rkwdafpcbgzcvveipl]jtutooefoewtkwcolek[pddkdpvzyumbkuci]qyeuvqqxiqrwuzygf\neobvoofynuxzuaudo[icwrahzvyvejahwlbq]ewwnptijkewsppx[bmqxtgqmosyeyhcbsvv]ojsamjjroupnfxbygrm[yqqusonrkvfmwpiwo]nueolsbydgeyemas\nvdmbxyiptwawwgfxzh[kmxqzdwjfyspqkptz]hkkuurdkmfzivckdwp[ncwldxetviygsqga]oxlfsqrbntyltzp\ngewjydarttmsjtqn[zxbhrkxlalwtmmrgfag]ouqpvnvhrcsyaepju\niogmaqbbnpknpihgdzr[xddekzhpwasgjya]qvqeqqyfgmcjqlljhn[yqwhbjjgtlspllovxu]yzvhuxwuqjnqqwu[mnqqonpvybsaxob]emyjayuxxbvtumvsc\nompsdhuyibxinkeelcw[vcyphnznqaeqzcdm]iqpgmmktiakqfpiejnm\nciowlwsiatdaewieita[sjaasprpfvlolpah]bpeqtpttkceukaef[rprweenazfnwtmfqh]wedhtjlhyntjrqw[hyrqbnvfdzilazmclcl]cnzbapdwalrxcbd\nduvtrfezztrbcbrpkwm[vtrqvfcxuueqcpbx]xmjukrhgfutvtcyd[ptqlpgejdqamrwxxbl]aavkmmqbqdkxyuwpllb[cvtooqdwzcluidljfni]pohomwwnjxhohmv\nieozeqgyrtjpfix[opyearfnbegqcgjqve]ljeerzciyhyvukdifu\nawjmnojyjmqatcnnr[hdggsjlyjznqadyuwg]gvkbbwfvbtwwfjjnpa\ndvtdsunzfozfzmgbost[cvhhdpznusqmedy]ayllrpvroikxhxetks\njyyboehdjvkufzixpf[ijsadnufldjduipx]zmcubrihovbjtdych[vtmkafgmqunhknoqttz]amdwppzqbnylhsi\ngblfvnsmtqowxewqrzx[kzyxibskmbrkunl]nqajypwcmviecsn[fvewudrwzvqashspitb]docgbflbdpnxxtin\nevhfjidivoswuxhsbd[wmxbybthkqklvtfekms]xnnifuivlakbrvkfaau[upixryknmsroqfh]tfaezdhmvigabvwfgt\ndvdsnwpipghloop[diwimibgyehecqflqtd]tnfzbffdhkvhfsbhq[rtmprhoebqdxppae]gczergujhbzsgdxupd[ezswzkaawaqhjcdgfl]jgwotzkgibphpas\noyuvlfvippqkkfxsgsi[jkfszneoxbhkxlorzz]rmotcrnupuzltlqurcv\nolonicnsustzovmd[kkmgnznlwjgwkkytz]usukziqukpwigcfvxw[uveqyxukqkusxuz]aqojtdccmpwlluelsyf[clqnppgmfzwrtlfh]obgkzmtyhlcounaf\nbgntejhmisbzfrblik[nitcxhpegfmqugmlw]rcwxgxofqbishzhq[jyzbrgwyikdrbof]gdxdwgpsfmmqejfyodp\nsuumjpqhafxvgmgdokb[lmpsinjodlukkfk]jhehvjrbweyoeivfzt[ricjsiwyhcomnsgltrs]iysygfjrdfebsny[irlxudmuuykkcxj]wndlninlcnixabgs\nxusauuaaldibtqcyn[hvjidaemmzaurmyyk]qxooscxoynakekchbj\nxilzzdiyoqrwzcnwklx[jzmgqccfobvufhdfgha]lzkfzklxafmroamh[xxdzjoeflrhqibidync]kuodqrpntknogybhh\nzfogxhqdfspdmvxtuwp[fshligclkdavscty]tkvaozljxenzeoj[txujxbzywfgqkyfrjh]fwwjvdiaceuyumeqscq\niqqislvjgveszvnb[qbfceykxhcelnwes]mgbeubhjgaydsrrps\nunvvlzfszuuztae[ytbzbzacrvxlksvk]aeaoeugpmkydbixbmv[nzznffshspwmlkqig]hwamlnoeyfmzhrxmbi\neyrqyerdzuptlwfz[pgehfansstewngd]vdlfglsqchelite\nirwhlxxczsizolo[mgrotoelpfspnben]xuboaosbbqvskeooh\nmvvsstnbgtaripcmiv[lqhlubezzcqsqoh]ofqbajkawszexqw[pytqrosnsskcgmno]ceyhqvutvgwawrao\naehuceoazqppxdvj[fekwbrgjolkkssozjr]ovwtwkvvxtwlatlhc[anrzzudeipqtlgvtibj]djkyozdjetkxaxrg\nqdkosvyshtjamlw[nvupkgnksmlfyivlaqz]vzjxmxzwetvndab[rjtknjbarestnsqar]emeeqkvpkwwwbpbyho[fxsxkmlskjyvniynt]yxdwuxqranfmwae\nmpkajmbuiqyysjiqxg[gmhxmogelodamttt]aboupdcqcaggrmjwo[uqmzyshqeruzquxxez]agzfrbsajxlgzgfueb[dxxqiqrjkpgalcp]qcqyeyosztojwikdqo\ncwzcxuvjuongdoellki[pqzhljdqxosuhdgqc]qqxxrckatnjwvmdjvty[qdlnrwhhbeldxrirock]kzsfmkvvjexhibpjfpv\nxqxcttuxwhriomnnarc[hrkxvrjviqxxeih]ofnkwkzmwkwfbflu[bsjloysawmfoigzrsa]kjajcjknclhkjofvh[jtocrkwufebomaervq]hawuelpfzimwdnxens\naxhzhgcgbqdeauomnjz[hbuvuiuidkykmvbd]yjddakntyygztrc[mgxbjwjbkzwnkybcgch]orbyhhpqxylsrzu[mygxsbzjoicfneimx]jddqvyyavgguqlqk\nsstrdkfdyahmpmolvuh[nuhocbdkubnidqy]fnhfqdyorbtzefo\nyoujjtvznztbjozve[vcsiywlpdylxwpg]saiwvtogtdayorhni[bcbwjvcnlvrcqbeexf]cxmaphpnniedclqd[ilghtvdoebmgoykzmjc]gqxcmtfqougbpixu\njypsrripwfsirlizywh[qwqvrrfaltcifzgrzk]urwxtgxsivdxexc[hxqqrmnggugvdgdcle]sirkwolflgudrrwfvnr\njczbvdpvkmrklaxdh[iqwzvnjtjhmulvo]amkhoscjxrxkvtrlm[nlvnfnszosucrhvafm]dpkerwgcehqnmxmny[xabxqyrisiuhudad]egbjvaumucthookv\nshephwsolmshfqhuslh[iqeoxejhscbjknjkgk]ytigxjcdexjgptz[mdcfmxfkyxnaaoixuv]ltysxdcxashhzrhfzcg[jrjzihjbmjzwwikgrj]zkrlixaauhydpmvpggc\nhdwtqxvelsuakiujcgb[vrzoeqcoqwpdvdxrly]fieebtoboyeztrohbz[unoqhtonsyzptmpgo]bxsxkyquwwdwyhpxcan\nwbxdrndbjpmgdewnt[hnmfgladivxjjrhgx]hhwhdeyhnhtngzasnm[eanqualmsluacqejow]wtycyvqujeitvrvtkhk[vfabcjjiloownkmsa]xqjgahkglpsjfcryzv\npsxpjyoleoctcjgpwvw[qkiussudbvamcbw]hbauvxvnrwhyupg[jbuclksbbwmdnddkn]phqrldjcwlixcghiau\noeiqnisrrknnuqczk[qhtdnexhjbgdaplymaj]fqqywiecdftfcpfnkrd[lvlesddgirngtuo]mfvvfvlufkoqwpwl[hljsgiuexvjatvztcp]ixguvozijkebslzjaco\ndktnilosvtkmvltdwd[vznigqxsgvlquhbquk]uinsbypzarhkgsgce\nljjdiiuiikwufjnnvjm[xjbujiikgaghrijcbsc]escofoimfyedoist[ltrrqmdcekykivhaz]xdiijidhpxdgqbtxue\nlfwumqctskgwsfvhl[sgtnklskhazwypsys]bvjxbzrabgfrvyvyv[rlityjbenmcoigrfmfh]wczyjwqulaqxapozcnz[uqbunpfwhfrvgqcozw]ktvibesxhbrooqt\nammvknbggljpkwpr[vnrtrxiwcitskywiw]ubyickjafcfifgupssy[cbkzhebhjtdbsgct]cgefqdgpdpcjlzrz\nwzpaqedqkmltsuij[jjuasmpwngjrynzettu]dtmgfvwtyxdfqce[usljscrncmnvrbb]tnevcveidnyskzs[ttmnmxqodycaikjio]qfhvrqvqpgjhkaaicj\napdywyijusgxzfj[sgbhrwbwywwisyg]ssiiosnfconncgiy\ngrownnednjxvuew[iniatygttcdaelocols]iyzwgdboxuadbrbooe[tojrecocburpdzi]oelyopkilwnsejur\nhfdpohrtqqyfntpfk[trpnstnxymqupxjri]lheljryczqxgvqip\niielceqagqfksuqpzr[ollobpkbzanfxcjuhrz]jnxizyaoygzbzciu\nnjpftdmpmkjwcngeot[mocqjgcycgznvcqjv]aixpwfggjyqyemoz[fmklzletfvqdyvvg]mznoxpgwowvjjmus[prrehzdyfwwuxvhl]hqppujbqaizlzvv\nvbjenrifdqsyzlwga[wmjenjnqufhqohvgc]uhrzouilmqjnjigwpa\nvwooqueyzrusban[gjwcwiagfwpvrct]vfqlgxbhucjhvobi[bkbtechiapvschnh]vjzryzyisyzyzewdy\nudumujkujngtkcfv[klinhdudyghspdsga]gxavvcsxqxvaziqrmsm[htseffbehxafyhoars]ghilivgeuuzjlmih[vtjpcrmvldjluqdazun]mebwzbxywmrfhet\ncwkfdzyxoayxukcgdv[wamyytyfmfaucrko]dchdvtpdkeonmdqc\nzklwcknfrvlblaamoo[ndrnobufquyjknl]dnxgeqvqwezfwky\nzbqgtpvsqcteltrs[uwrmlyjkcidsfdpx]cgaobtbuuntwyuhxmjx\nlbbyafbvhsilwmjivv[fkftqvaahnrokuhu]dvgaejsxgjuwiemu[yqopsyejqtvmlfxm]gzuulybydsrzhigldh\nficlcqjefsddeds[kfkmusacvnqualtppxh]drbsbqefpdoossbkyng[uvpyqnoidjnssjobt]gsheeufqtzrdsil[jbvevjzeugpmopo]nrgxwajuatycddzwr\nxnhrhgadoziectoigmf[jwudbvxzwdfuubhjlt]lupnypmntyrvwqzlb[vvfvttkizuxshnhhw]lfdrjokdrbrcldjfs[wawjpqzozodmnmah]vdbjaoofkmhkjbphx\nfsymutmdbqyguwut[qvxhywjtposhjgwuhxg]ftwhtxqxeicsrlfye\nfglgkrjwulmkxbzolgn[vurpqcvuydmympiyofl]nbzudjasxeknjid\nnbtrkgsywnudokk[vurfuvkjdvnsukh]vkmqsmcrotppqorkah\niqccpqvhiesnaohkhao[xykqfbmojjnscqhdv]aqlxkvudzlrncmpy\ndtlwnznjqsixssrsaii[vkikcmtsepgtyqhica]ovcpoaucnwravbozsg\nnobwzchgrycgkxc[tqoxhzxeorivdtdkde]ctdtkwzsvuxfgjtjg\nzsknnbedctklyuxngn[jjzvkixpfmskcagh]fkvhsfuckghltyqk[hmygppkjpcdicxw]mnurqampwwoiiynr[jbkvqeqrhnksizlssff]xhkxiwlzgvjdfakjg\ngqbxrvghncjdllxtge[bjuwjsvewzvrgcujf]tkrdrbempmwqujk[pmbtbgbrgzpxeoqsxw]nfvaaumgpjysgtvk\nclfcvnwzcbfaqaj[prmpnpjwklodeukzznp]zukpytpqzgmlbvidv[qhfrkjlsbsqufgnet]pfhfcxzeiowmgiyksj\nvogrpuzrevmatdbqqx[qolpybjnetsxcqfcvbc]ixxogojluwsdsldl[bztslfanuylwdld]xanhrzxetowrgift\ndqrkbymiudzhkgf[spvsqvyntikovrefqc]bzltachhfylbrzl[znefllzixypjdkmfcxn]mtpikjxqsppxlal[oeyhdcnpxvhawqbmkzy]nxhshzdshsiercr\nxmgedfiblpeazvgkss[cwbtqqjoaqbrgbptah]clzsinbtqsrkudymf\npuwqcxmsuxnmneuzrhj[dbljkganxzmjvtxgr]ekmomoccimbpbieaf[khezmkkqdwkouzb]cpkfuyzfdfxhhhuhk\nthfdbnkmqrektilpc[weshzvpsyofygysio]bffomelkkwvfsdxa[owhidyrjieeietzn]kmeqgnvyclngrcgquc[ieikyuuoliuiczq]nnqhogvlhwqipvpiao\nzsdcvcbtwlzlzlmteky[nrqtpxoefofrjeaf]myjmnezlzkfcpmik\nafyxnybelqewnebaai[ddjgeajpzswwdrg]qfwfqryofesysiuznz[ouajwvymsxmxzvgdx]ryuvawdhfmfvikye[kuovduidpcdyepuoq]didoelcmjebmytdyke\noopihddimztsopfcia[udmncuvhkvvbcmxzey]fpehwxjiczzhqcxxi[onmizmkoyhadrxpsemf]htycdbotvmomguwbttt[gjsdzuveiuvudbyakzw]ramxommwjmpkihl\nbwlccfsaovlozdqpsv[dniiqfcldfhjiex]cdzbfrecwehrluxzprd[xpyzvlqwekcyglksq]dncoqoaakpgnbagf\nuxoopzavjdqdkaz[exsbnpbaeuvusypih]qgojfhbprpoavcbxysa\nmailxensjcsuodzpd[ftitdguigzeundytyp]fgoitzvujhkjynr[hnpcvussglqshxn]debsveizfcuroqrm[yeageekyjhilfwr]ozgpzusfpbyanxnzuak\nvxjnjaguqlrwoxlhfbq[zlqpitkigwihrikvr]dysutdfrbljdzjgcw[eslbaxzslwoxscpgoy]sudodfmlfyuczzf[vsthktidtghtmazbip]jfyoxxiaowptvosevi\nlgxmivlggzfdpductjg[qxgoioxsurcwayndy]uwlgoodqsjoxsjqqln\nqognhfgzowjikeqz[nkwezojneylzwfdm]omduvysmcovvpvse[bwxvkzoqsykfils]jwgfmwxajhmggos\npvuwgxmpcrqknzpbkg[qbpmfthtmbkmljnsqs]zmplrxnulurhzvijupv[tgsommhtbbujbjpf]qaxqxdxmpqwduwwxpgg\nlzlrgghqmetsmcxd[fjffxsqjqctkxnw]zlzlpvksrpnatxmh\nayirfkbsdyssjjpqmi[vpkvhbtreetyxstwcqp]rjbuxsgsrlqrdnpyg\nukqefgljywjmlce[nqjcndjjdwohtizoed]njfgjjqkdenohbwqm\nkdwzhrslryuexdgbcr[hmbcvmrrmbsvyaii]bqprdkrgdlwjvoiyb[mqbaokwptkfmxzqr]wcauinrezkhduhcktrd\nhbtuzqvyldtvwgyumzw[dibedlwdcjyfngungt]towfeyxyxixyxee[libuilcfsdkejjl]wzzxfhwcgawuhskreyh\noxjkoqahhqqcxcoxksg[bouywtiajyfmanxcx]xgqpjxtkaejvmqckkuf\nprhqbaccndsoscdm[cuayhbnfywztddbvww]psgyhytgosopvbbp\ndxdtcskiowtdomepjp[islofsowtuyqvcqwb]pjhyaudkqxxlwfoo\nvdatepedgnvgpah[jbooucwxtveomnpmyx]ixgsuidbemgmahtlt\noncdjplunkvqphbyb[uvivlundxhdiwjncfq]dvhypguriulrangqwr\nvipebvitwbccsnahjhu[kpwtbwddwqgyhnkjsv]acfaqhywmwbkmgh[nryplosnxtbkpwxtkfp]njzhnytzwlprvfcv\ncsvlzvkinldedsxt[dbxoceaaismltmspg]yomriudrxzmlbbbm[qilkpyxcxlvtfzqmw]rhwekeawwpyngqxzc[akqljrphobjicoco]utlunpkuptawrtfcccv\nacfepkrkhnviixe[cvksybusnhacmfoy]tmqqmgfdharutrqvdpm\nhjehtfbextjkaxilhaw[qvavsivlumfavaafhqz]ahdjvprlhlmuneewyxi[rzeuqtjkiuacirxsw]ucmfkrotfprypzuyqe[rutydtgtkppegdgjn]hmvzjyquxtydoujq\nntosjqtunrqfoboek[aogjyqyzxpdgopkpbx]sdvftoxtcjefotm[jivgsxjogxklwkhm]cahcjmgzepqebtn\nomkznbrlrodmtmnhwsu[ysoinknpnzrjqkf]ybiqtlzoiohtldgoaud[fbzfiajeahzmiplcih]qimubctnnrmtwro\ndrdygweayxraomiblsc[oglpuxzweqpofwi]mbipxabkjqcdscltkh[axbvkumlaforzbqy]ircpsgstqyzpwnv\njefmuplsptisjqguywe[lkgtuysseapteszy]wzcehypttzjhjfp[nkwvzebjrydcwfkqne]tnmaxtrhvwvdnrhpxne\nelfqfvbjutssktxpdo[paguttthfghhyktkjjy]wkpqdurcibsvviqfqpu\nsuzpbjqdiebctwhb[gwnbzgajwrorqcx]qoqdgemwbkdpsqgjds[qgozargzosdgbgo]hbsmqrwnlqsdans[vhppwpwwamtuurulc]ylczevsobuxtdhvyg\nqfixarbnawmgjcga[dhgdmxcpwpvycmwl]mkqfghairqabhmokxk\nsrjvnnbutjaeikkbsd[flieajbdmghmuzp]ieimmehrnixqjynp[rjxiepmrhwrmrpi]yfrfmlgakaehvqm[hucfgczbwdpxxuhk]bvgmehildjqbjdu\nqcmjtgmmgybxhde[fvpxdzdmzkhxdzjfkf]qfnaclxnryinmvpgr[pcsmctnmmrpxtfgi]oszbhmhynpzqvtxso[qhpljywydqpnksmwzdi]yqwxnvgcwsdwuluiouo\nvhvuumgtzbrbgazpo[epktoekzvomswsqq]bbkntocwjpaxaoc[rnlzbqxqcuyltjxepz]iaelcpyexpoqavcbepy[azyksbvkvgmgimw]kvknvptkveiacqnzll\npkkcmeinlwpoupwpu[qtoyfabmibfrubvepwx]atgpzcehuidgikzn\nsrwntduyxjkpivzkgvl[hmenzrmnnisxgodof]lpuawirahbvibfki[gazzozitxhvxixvc]knbuydfpbjzupju[emzrzykcaeukvec]grtwlnuzmqivnvknug\nvzlbpuiceftddittp[srespcesbfprkwuku]bslyxxcynfqywwu\nicolypvmrgrhuvj[fgpeakrskxaljnakz]bqxravyjmdodsvhf[cjyehkcrdetiknsttv]dhoghrdxmmzxbjtbql\nnowswrulawbgqkmcee[qsktncayiihoxiu]wtsjxnvcxdriviyn[tebqonpavhbfnwxvjc]tvpwgpgrozhtqtiy[lhagntjbctcsdejajh]aedpfftlvvtmaqneaxd\nphiopnkoxulhkaddkxv[ueqfevwkcjwpcmsfspz]zkcoexersqysbtqdpc[nmcsonrswjxvdtuk]xdrsvfxrrdrfdbny\naosrkxvljnapvnux[ldzgwtxmjbynmlp]yrxxllppgosniqv[prtvqenfqapocxdrlst]gypcighnnppaytp[azueqhhtymzpujx]lsgvwvvgctkiyvlc\nrketxmupdbmrircajep[xfmnkumekemjnwki]zurvxfxnrrvkmkrhbxh[lsrwyjtfjairiuwbaw]dyvmozkzkcvmunw\ncrxtvtdwdxejpebbv[xthcfmihpjqbhrvqfkd]hztqefpqdtgyhfzqsi[nlaeacaqscestvv]ylbteskdlwjfwru[morvntwyebnmswguff]othonakykxxajuj\nzclhqcnlmxsurcrqaty[stohpulyrzcbabnydyp]veajkekzuxjmecdzym[ysujzinvkawzoqi]hfkcorxooelnfididyu\noejzfesyaxeittrdh[yziovimnkfkadiplm]arzmtikoiveyvlsdkwd\nwvdwkqqmnretidj[smwnemzwzqhclpkud]yzguktkwahnuabs[bbyhgwmhhbpbwij]qstxwyfjjagyqvdaexg[nkerjbdjlikfgdv]qortpkyhpqvvebjdzw\napdkznwjfxwdrsm[fddlqepbyrbrfgmyeiy]fvymcxblcjkcvpcyup[szsfswjdzmcabwuz]hmutpmhknvwrlwbvs[vpfcztrelzjnqzq]gqbpttcrakuedsp\nsujqaghlxszzfxf[jqybozaufdtanwa]rthiqanlennnowvdkm[elvfekcowitcout]ntjaqinnbwtqsctwrz[axpnqwfjmkocafoeadn]aplpjbnhkrcrbebmo\nhzkbvadkdojwmdmdxq[ohmqkaainyaufipcso]zojzxelggufdascjz[zlxncckagxntpzqa]kindyikavjkmhopcnek\nyjcsnegfsmmnfce[ueladqjdaqflfas]wcifctlledgnvodtlzw[zqswolvsfhpyrcivk]vemkuyjebqxyahb[ydjhmgjxmruwwmq]cufuqsyyytlgbpwrj\njkkrynqxqlgxukyfv[fugivxklerausdl]shcuiixkbmzymoxv[thtakgbdzvjsjsera]lmpwzqhthoottxvp\nncmijtczixmeyfuhspt[ixlxgrsyxrebpupt]sdoinvpfizdezpc[xckbxvncmseucrzjo]rzxfgqlionzaeocj\nxmqnycsovydhyaqiv[iuvymmaguzbrtgs]zhvxodssnpnhajwzy\nrqqzaaswdepcnnmqfif[pzkyyjprisjybnnjcq]kqpjhykszghcripq[vgdhuqujrkqljuc]qhtxqkqygazsvuh\nqynvobsdeutfrvb[fddgwzhlhryauxzb]etznfbueibykerqfugr[rviezfaehsvigssm]nwhvctxhqvfdmgqe\nihonnjncwrkvglabk[pnjachlnpyonivmjtc]uoxellmcbixrdsisuhb[nkwsdmhisjdqurn]bowvauofupqfmxf[liiytxrcuwwnimdurys]acluoarkxopwppv\nipqsfckjkqxkxyuvxje[arswyomsnfueuwmcbev]mmlwwcviicdmllylq[jnqpolrlwmmccsd]nfobgtdlxveuuldt[uebjwwikiebtttgqss]ikdxnjdmzbrpqqvw\nzhjywcsrtcadzdrby[ynasiklerbnlgidest]xhzwkwypktpkqgfyh[fuuxtaekwjpobdjfvdh]jcsrxmtbrqkerkrc\nosahjtbzrqukvphpe[guutbgosbfkaurvuf]baiwluaouikebnlgf[cgssqcbscupvvadpbt]lxwmvxorsfcaorccxp[jcqzcrfdkncuoqj]gbgdolqdrauivfnsyti\nvvqcdtcodesyomh[efjjzleahiejvczmsd]naeosnsaltqgjrk\nyucpovujdwslgdczxzo[fbnfueoeatnphvv]gwegeafilsbwgor\nthfmmzylspbxupt[asfhmdmkqwnqppnmu]awoxkgkgtrkdjzz\nghbifboivgelqxkfeo[gtpozhzqfntyyoodc]yjqcvpimanwiunamfh[aglylsuuakjkmqx]edfukuqcchtbhtblcf\nqzonwqxjkpwqier[qmrnrkkwruteiijirkf]xhnrnahamaegfla[fzshmzjiczdyzqhwx]acjlrknukkbewao[afpeaepzoljqxcwvs]dlvdxhsoljmqgmvzf\nmzibkpddgkilmcwcshm[sgpxutpcqniuckl]kqiwkwdgydpnjcj[exyhorurvawneziiy]njznkaphsmgisqyujms\nxgzabblockmothpuxc[mhiwwhtpmtbxowbnp]aucpfqmnquiggenklcx\nrnhfshqrlxczmrcz[agxxpteadztvdfeo]zogmjfpebldprrmqg[zppblhkevlkqlyie]mgovaojjsutbwtpzsm\nkjgtqizmvuqerhb[dmhtzazyzqwjhpn]knmrbytrwrcsonmshb[oiazannnreojooa]hkhackgpdqgyqsgnb\norhnenfhsjyibqacq[tznvydkguvcwayiwmi]hejujxsitqcaabjwskl[qhpfmxgjdfgtgmy]ahilwlhjkfytezctsj[ewxepeeisacexgtc]paxwwhhpaukgjnafuwl\nmhmfziehhppfqoocvju[hmfnlywpplffsxwzg]bkhkauhasnuoglve[oytxewvmknoqchvy]fyodxbpsytyeltnfsl[wojcbkfsswlcuqcz]izcrkyxzjclhkfuv\nslabudcjhktddar[cvkvaakjffjjovgus]ahgxzdctihvboiarn\ndegyynefmxidnbw[zcfgkvupltxmbhroi]dbnaezqekcegyki[tjrnhpsmfftiscppybi]qgyifwlhvccshdiqfx\nsxszfjmiathxoqnxg[smizlxpwmelqjlf]etoglecoddmflqma[hsggyxsxkhhshucgtnw]oqzadjxenphyexaqrb\nkqwjndajvawmwxs[fskyhhktkilzwjtkt]ufpvkdnhygmuzfsfiso\niqdscwzpnnwehtqmwrd[fqbmsfrezrkhqcw]gqkpkiqhtrjpusoefg\nbhwbuaqjofxcbuxrqub[aaanhuielrhxhlzscv]fkgimzkootysfzwcan[svktoznaqxkkibhigju]fmqhtjgxbrovymq\npjybsukpzvvyouum[rzeunjnideaseer]ltquzytuezonpowuhdn[wzwlbeegsgtwpzo]hqivrviswwfsdmpgnz[fhabjemewetsjrjhy]lgbwcozirgljoudhng\nampiucjqxwrzbdtcjnr[ufubjvykdfixyzqq]mcxabdvjzhohlcmcu[xihctxapmjpmrev]mggwuizzzxymhypmcw\npprbxhbjbnlqecvmu[ewuffgnuylwmrcvkbku]bntyrptthpmexiakh[lswyqkuxrfzokacp]rvkhcgbfnjivaagp[mnpbbcgrakjlmdqt]bujykhlbutiiqyke\nxtcidzkptvkjakxl[kwjzzydtkvjmqdz]httbqtbiyxwryblrfd[cyjwthdmalqkqvso]knfncfebbbueoqze[zuruluaalfysbnmf]vodfiptptwqpnllvbdf\nwtjthnkscjzzqrbpc[eirytrqekucxajz]ghycghnyntrthzkechc[eiylrukgxsqpetjfnv]xuiymnuzydlawjygi\nrjrldatkdhvzvgcux[iuhectextisybzvz]vycerefkzhnmdyg\nlqftkkvpvepilrmyty[uptcsbeqtmcljaziisb]himkwiqkrogoyhjpru[wxocqzrdgaclbeefd]mtytxwskqznxgpfex[whqbcssppfhqedhv]cbtiuzgbvptcticlbcg\npbotpqbiqdjzsmpbki[zqcshqinikcszjm]xjxijypculvuoavvg[nltkubwokrppvzifi]dmedgmkonytjzzk[obonilwwerhchueuf]mlfqiwmaicuecljj\nexlndpqjplyfdbmvlji[fzzvnaszvmpwpdcovj]ymothxghgfddmzqtglj[wyfqyqwrhanponsr]ydpntagauckmdqpjb[icumanaybbefssdjnqz]owhsbdpufodsqezginf\nukfirftsouqdsgbgmht[nrkpwksebkijlha]zfkumnifusjysuzt\nuyzxwkcgjfsekdhktx[qhgrmuyjmfmunghm]mgjbupndudwultdnnt[oczntpgnyanxxgdqx]oryrlqkmroilyca[xbevednhpnvzzwmrorm]bdozfrabvamfxae\ntoqvrteazudmppbrxct[cyiebroauwofshvceeo]fhoxdufwnvmlwhhp[xykvdatsfccxlfmn]zpqqflqttorrmjs\nltkcveeqyawjrryerqa[zxoihtpkswzjrhnbvz]cfpirvnjowhsnnbehd\ngdiyzvnydjwhfzrimq[lvieihnyxtdrgrbs]kpotvolpjgjtfiqf[koloumkhoyktylql]cxgmdumzkygpppqe[aywuzxkrvrevgnnihh]uplcpitzxbcqkmfgsy\ntskqojnfadpujfxym[xomwfoclpvyejczgyy]lkmawlhwgnpccotaetj[fvhbgpqqvasfykn]xfxmjfyoygcsbxl[ldveqjhkzxczzgxhbxh]tfpibohzhgrythjgqor\nxkduagbswofivadpo[mxlqngyjwbqfsszj]xoxngqbxwsttknmtcyk\nzvmlodxbacmwvdti[itdxiimzuvluomfxq]ymrkoyojdnsjqvl[dihqibcaznldgoteyx]thrrpohvatzogxrz\nsoetmauqgsswblf[hlkchnarzzrgjawosj]zsghpkoexwcujpakaou[wvfxggiskbpgntosh]zbohdymojoxhndfr[qhyzatgvedhoibktw]iggjhmravyoswvu\nmwjmmmeiclpjmvishbx[dbmbrjcjcmbnqxq]mvhzexhgdmmnduc[yiccjcrvmzjvygs]uyvqfjmiyccasgzlz\ndsfwjqahjoozkpei[olrrkslvxvijsyopa]jmzojmvqtzvkhaxukkv\nkudhszsgsrenjqcrbp[ipvxqnbradyxoline]srcnihnhywqlietbgqv\neklfpuufieqqdfrgouk[ycxgdyairggpehtkim]sdfhxncpiqxguzlqw[ysjhhepmruqaegxp]wklvpveoxxfyizmf\napdypwjfmxhjgojtb[zojzoufhucunvjr]zjpuqiciaujfbjta[wlusnbuvcffrnac]ecaccicpvcmbomsvf\nwenmnejyihmxaxdqwqw[rckytszqrgaxmjpbqh]pngxudjgdtbshebyv\nieyarudhbjrrevfodgm[grmjubbiqdodhae]mhzexlzijmzpltsxjfa\nbyfyxjxqlcpjxbpd[pdqkhutluqjoelb]pberlwpeqxmovie[zkholwknvgbfxcyymye]askmwovcktpqhcg\nccjcygsnanyvdss[frpxggwvfjuugdysypg]tuqczwtmobkusalqusm[ignjrlsysasfmzasa]nfpomrlygzjyylhvypi[lahpgasntfymdoub]rlvsrtudkvhtwhycf\nomuyrkrubieiduzegr[gcigoszvylmdrlrc]jtlrlsgqxiqtciehh\nhqeghunlieoqhetnh[unjtmdurovonejpsjtq]xtatdniykzzxpufps[ysaytzqvcxkvimhql]tyfkttaoythcttexrp\nciyuspkrywyyplmlro[myfyzvlzntivldrquq]eighmudngyiwlsme[eukgbrmtghntxpacth]pmvxbxswfexsnkxmm\ngdbeqewbrhyfbfpeti[yvyiclmkwzelbqi]sktocytuvyvpcia\ngnfkqxrtauwnkhfoyc[msfhopavdyhpvpttg]ewuyaxehxbyziwmxd[iyqrfiudsalpmpk]smpmubdejyevdggead\nrqvcsivlxhfyboxj[flvvsnglektzosreb]yrfdzdgvkzgrxqoyv[rygmqeiccgtqqmni]frypfnzvhkzvlabrr\nidyqowifirnwhkk[vloivxhtkdzjrbuuzmi]beozwodgehayklyr[cptxwcsgsapmprrp]hfrdeefhyehwwvghgdq[prcadfsulvamytpsfo]tyodjlxziwyqtqmi\ntdwoqxlhhaqkdmv[cxayaazioswycmwj]pkenayaygxyrtqrqugi\nvtqeqlrohgalpwrqig[bewbjgeryrvhzwetm]hpccsjcgunkysntpwp[yefsyqedopuhssgo]jjkkuwoyvhzzcmdlvv[uqczrglqumshdhkdkut]dlfilxdlomkvtjhv\nfezgzsmmxdvhtmy[rrmbxexyopsrhxag]ezltorfyxclstzhp\nytcnqprainktcjei[phwarjaicrgistkt]qdtijjhbywixrie[llwwjrzrxhaqhie]ufaezqgmmdhhzjzrza\nuyvaorvuqwbbexmafbj[tnpwadyyakeawtdextg]tiqechjccyyczpvbf[vaqfvvcbrowtjxyu]oqswjgtolyixytoj[ismczyxhizrzbbpscus]rtlaqgqrcxpjgmih\njzamkswiztvnelaqnqb[iptcqxmvbgyaeiwob]xnhehagwcwdgsvpomgt[jsasqvgectyfdja]dgjdtjlzbkyyckvy[fobafodakfhhiem]thozlpiakivgzzvemu\nowfgxupnufaiuovcesw[jeskiymcmexnjbxrbp]obganlgvlqdczqrvwad\nchsvqakwmnabitpotyv[eqeyowfftbjxdkpyf]cflqouimlafrxuqvh[vgjbvqafqyzexrzhr]mnywvcxtgsaifufkcu[rtjuztroxgmpkbnim]xsqyofncdrvdpin\nkufzqdykjclolpveo[fopvuhisayecxlainzx]wvrhymidhtoldhb[vylhmdjqsdhokif]megnkxywjthliwepc\ncqjpttuijfdzott[wubeiefulpuuhweqv]cqxbaudhnmrvrigogf\nhkzaqueemmhessqjq[xofafbaefryhwyzzuoc]yyzaekuutvjrwnhonpk\nzsgyhvutvjmrgnmar[kbxkhssdsmefafntsr]ocjxtkpqmugcvkopvsu[dsdwezhcblqssurfmlx]veiioiyfnncyfrdwyv\nnsqgaufitxefakffd[brdfctppxqczvlohw]ntxmfmrsajxuqmo[pbalhistyzwnbfs]inapnupdvnwtlvvu\nkrtwywfktmbdobnq[msnsspogynsnwdb]efcftgrjdyygncnqdks\nrrasplhwovftrffuw[txyylwsjezcxalx]voncsevbgofoiiolvk[axcouuspjtfzsekglc]qoutiffuqnorbpnlp\netyvjsjqwelcdzpnjxm[eetihszvjrmccshr]uskafocfyjorzhdx\nrqfzvsuredndurz[ebgtddsixmgsugd]ilczpjzsukpyekhobu[eeciaduigoflustith]ohmscfdomzprzjncno\njjjarldpnxgwvlxve[yjoqlmnvtslexafgvbd]yngfttqfsebrcwtctf[bwevtymxqlrpqqaage]wdcaqtgkvmzesrjex[svnkfzogwcsyfxoxh]hvrsvxcpdxqmlfhb\nldwuplbjkimdskui[flisuphwbiqphsddaxk]eelzsgjnvecwedneyb\nbusmmdpbgxvdiytw[kwlhqlohknjgwfh]xgmkafonkyzffqtj\nngtpdikbtooilycy[dwpneelecozfzwwseg]kwkwssbtktxenqbnyfs[lekbaoqzpvjbnuvq]vhlbuorxxxxztocuiq[rscjyzvyznunxnun]jhipkmizwfpoxeuktk\nleghszcprzadwpwlakv[cauvyhahnjycqgmslqr]pisyfnajcsrgnvkhcmj[ozrbuuodecumxzbsr]gtqbofuoteafyjk[sodglraziyxhcpm]lbzccqgejtsczvj\naiqnofheehbiqxqlg[wojpqldgrsrkqqpywb]dyxygexggvertuktz[iolnpmkijfefcsebi]okwjyjatnoyvlhe[zbfipzfoszigysxpwu]jitbvwjmknigdnlt\ntvxhyndcnfrobfrdvo[vwbjbbozwjpolbmlkwd]kzsgbhkshipoxtfp[sylshvahmztsbngdl]emwcmnpjzydlvvknrhn[aarrocnhsmnzqgozo]uswudvvjntlhqjc\nadbrrsdjlpyizfgvuc[qoimvkfjruwpheezeuk]gyjjepfgjpnyajypq\nxgkzhzjlkwacqnihyns[bmprkvdabnasxzqzwg]hxwyywhnuntidvpg[mvqpemdfnvvdlpul]ttqocuncdebtomizabo\nzztkzvwguaggryld[fgkabjmksknxlfhzpc]iysntrtaaweknzbxemc\nocwsupvhvpcgwehx[vnmhfmgubwbhhrmkp]hqpkkwxwwefzojltpph[bvsvcgwsztazzzjoxi]iasiueagvwjgmcugh\ntkxywinosybkrutpu[eluxrinxkarduffy]brxgvdsoguiggjfemb[paaawmhcmdxneql]qtvmkmlldspsheyac\nvzcnrbtoegbsuglk[rqhhdwpschucsvlnq]hzjzijxkcoxpwhi[glryptoeiosdosoj]fhduvpzlbptbehtt[yigihwrodvsulsrsh]numkgigkznkushjc\noexrobvxlwbqkrigz[nnbfhaheuublajo]pvlstoxdjdlbroezlbj[ykvlcsvqstxycpp]rxxgokhffgyioltc\ncstzrhymnqxwtwpnvh[dzbyzhzvaooswlkdrof]dzxgsohzaxvkiwho\nhftmeaqbiiefqtwklr[bmqfhgvsfrywauxq]brzoeoncrvljpjqxpjd\nvbnuypzeryxltunvcb[ldnuxdvgfcbbysibhop]ejgwhaxwgnnbfide[okhykghpvystpufnxqr]umdmoixuvfqgecr[rkwsaizjzxjgmmftw]czzteyolfgwkrnkxid\nnvflxkucsnbsltnp[iqhnmiyolnoxjzjzjvl]ctdsnjzjaflstsy\nglmwwqvembkbsnvs[skbkkvnoycklltrnyrd]irlewhaeagdiojbr\ngmzbjlrhyoqkiyrb[nezqwphjfpghjubnw]lflopkhihhamygznxv[zuecanynqmvceqxyy]kddyqjerkeuhuamjxcu\nkwneigdpqhtznqaide[ncindqlugpdagtfzf]ctutcducslvhztsii\nvhjlncnrshwikfm[amlxjsoevzrlkgoxnml]lztearcwiosrcmhfi[gkdbcfroyrgwylu]mwhzhimfdrflqqihaq\nwlswesjcluvzurgrnul[iehnkjghqwvennpj]znqbjbnszpnklctx[pkxxihelrhfkiqizi]dlmwkrxyjxaumvtlbc[icgjedlkxpjwmauu]cpbstqjtdebbywkf\nyxjwddyrzrzhqrarheo[dcayrrmkvazrzzlpqh]gkvbwuimfochtndis\ncmqdgywvwqpfkixkga[zkcmkmqoxmpzued]iaerrfcfhcaidkkvwvm\nuhwbwhbgkrzntdxrw[pchhzpiwclaasygyqn]oalmglktkidoijgyg[yugfmrxigwwqldfsfb]otdsjvxzdlsdhnyk\nctjuabhainyjydm[axxsgakjkreoeifx]qaphofrkpiflusbeecj\nhdfthabpjjuxgoh[zskhkbvmwkfmqct]vmqfixzmyefzvza\nwnihepbftegtdrtndsc[wtmfxwvxzxorhbj]oqlfpicrqpjgvmo[zyvhvkalgcwwjucnxq]ppatiiiatwbpyiwjr\nojaqpoarskgzmtrj[blfchukdercwzqa]anfsoaopkutqfqltry\nofijvkbfofbyadh[xmlicvxwtnufzpn]jetnmprdolywrbmjes\nfosypykuipsqxaud[tbfwtcrdgvidqsg]tvmvfhrepppxxwme[qpmrvterftfxchiv]flnooydpykdzrtfck[omhwxcdomygkbaeqrfg]cwztbmysqwpqfuig\nlvojllusjibvayrr[izfttqfhjethscsrghs]egzyjonmwdatznvzjw[mfxjaelqslyvkaqir]ckbkobhykxhocczot[oezwabicsuchjia]ivolkjcvilnlsdnk\nacytktosnzjatmwue[medgjpfpvbiqgld]rjsbxcwqhrrklyfuu[xclxdxjcgjwkervy]mspnrnsznpccgcke[ptntxmnzdrorgoexbsg]bovvgignwezlpgoy\nwdefvabtqsgstwhdxm[otahaybdinlnszsaan]xgjagsgrnziuqxjasw\ncqkpuofhsousjfnlfxu[syvkhshtiyisqmrdp]vtvtzgdxigpsxcpdkt\nqwagfdeyxorxoaphzt[kijseqropygskgre]tnpsgfihigocogn\nnvppsgsgegzthtmpt[dsjjswqmzkoqtihud]toeoabpfknrnwqxk[hgyvhoktbvmdvwauue]pniilifxxtotvypye\nnoijjdbzbeowhtut[tlfprbqoqtftqnjjs]fwqyyfzzbzjeykhoje\nrewfvmohscszlog[dwgnxketzlgefgf]fmvoxbzpxywaicq\npvtakzfeeithcogo[mbktbqqelkzddsmn]nuydimwmhdyhrls\nqfzdrtjoipdlwkd[fsymmkclzvcdvqexr]yrhwcyjdzgwhmuijhth[zgturekjlobpmcje]eywzpwpfahsrwpwl[bgyprfkbmyaixrqj]fvhhmcltucokvqba\nvbpnikyhvhqnemdo[lnyocyrozyteoxalil]phhqtzpbgpzrusr[yygaktzkmithtegl]cskivnspoecsaoi\nobaxlisumjgehbkpea[ehzysfspgzssttpebuy]vwceybunjzvlqevd\nfpanvbmzhlkcazo[wfnkxffkzmxnslov]gtifhhnlnnxkeaolr[pwkmfvowikzjctrje]anfzfrtlihlyutaq[vbujdswyelmwoudg]lckbqqgkglpkfnhu\nubsustsojocdyjv[obkxihfxtkbaeusurk]zmlqtgokothiokq\nfpgjwchgmuuwpzquwf[xtluejeypvgynbsdgip]nyztcugwqufjpakuxkb[yanyavbmpeqlalnk]tknqteuqrnnorhcm[eshuljurljirasr]supqastijujykowxxhz\nsolyplfhwchyjtchjuk[wuwirpjuevkxulrs]axqqiqzteislutclbzo\noktlpryceitvhqqjqxq[ufupbpapoxovifhqp]xgrwutvfooowfaxs[yxoxzdoqyhxsiwcxrgm]swmalhlzrknfxgnamr\nkmmguldgktbolgarsp[lxrqjtqbuhuthezfcfm]nhyafiyealodqrmagqq\njfowosecwpywmrwka[rlvhxlrwehljixaggho]tadphuxhvtyxkgvyru[kdwmctblkvpkral]ufydjpceosbxpcy[qkiwffygsjragvq]zlvqihgbbhdojkgjgj\nfjnehklshlckrcdhxk[umipduxaengqrizo]obuxhxbrybwifedma\ndzeftgulomkuwyrrm[aphjorxpuphqsqmp]nnslfcfiblaexsbftwi\neypbooqqyvqucqvyys[rcijvtatnyzpafpqhwi]jrpwrlhuiihzfwt\nzikyfwsyxwrtrgdkjh[netvaemiverwhfctosi]xwdoncumksuzsryj\njxtpnxhjudmsotudd[lgvfscyjpngmela]wumifhvbwbmmticp[dvxmvcccimvvcrvpist]czyqdmwoqjgnfvjuxul\nfvmjytywcfdqfmfvj[nhufehmupvzkcrtewz]hyxlzunwnjccnnphrsg[hrfqmrewnweuyulb]hmqxiwaqfebkvxhv\npeqyzkuviznbwojhtys[svfilvdawzpmtygynd]fpfggygzketpcrrqx\nttcupspyysrbukznk[rpewzuewspsqthbqb]yszbsclsnmbgoazsfl\nvwoufilgfhpaqfxt[dmlwugzgaywwzqb]rkwtuggupfsffridmux\nfaibpioziimdefafugx[unrfywlgqlxqmwtxrb]owzarstubtqbwwjlh\nmvgbokjnhpcnsgcpm[vznublzcbsgzahkjprq]qdhqdlpftbetdzckvs\ndgpkamepjkfizyaknmw[ctdimkbvwctjqcbl]euwsfdqpvfkrxuwr\nrjcdwjzbrqqqqljqj[vsrppwgvlsokgpn]rxpddxouefplfnctudb\nlhbnntitpjdtprbd[cctbkujpuoegzrijpus]xbkzdntmvzbzfxljvt[brlovkywclhnnoyrz]rhixzndklgudnxkr\nbyahaivirlqxulwdoe[otyasqivnfuwxmpn]vzsqfapigdecsmaqd\nmyozxxksdnucpxq[jgpjjngigboxsoy]tidzlszxsdbqxba[lctczcenpuntfjnf]hzdlcamkehorgpz\nuoylyvyljpnzqimzgh[umieqlmcsmhnnxle]zvxwqjbaemhtoexyzr[gjyxtenkxacukadvhfh]kwagkgvaqklyfurjnar\nrqzfgsolwpyfzeg[fqbhyjayacblhmm]egufazwxlncxundcyyw\neexntdgtjwjtizhlc[havetzocjnmfnpgzl]rmeusmuumcpbzodie[efuqzkuscnrbxwef]ehxrajahcfdggjyq\nozakiysvzkycefw[dcjsobqhxqyxnvwz]yuoszalpobgzxqk\npterhsdeyetokcbtzn[cdooadgsexdxfzjmo]xdxrkcynckoeirmjnlj[matsfmymdliwcqlqf]llnuahmiztvbbpise[egvzoittbupbbqrvd]bantcrmtkbvvbxi\ntqpfhtrunndzpsd[zjzqvvckxscqzavcig]zquncdjejdyzegvcm[sxxdynlbdymictrfspg]smgkjimutkedknlppsa\nbyjykuzyigqofolpgf[cybrboapdfgimjwjm]oczicilrowczdlcy[tyaduotkhfvyatb]iklhgcjvfdyypdrdbz[dqkfqaadlcnxfofsvw]syuiaqaemufewlijxk\nflbmovywhikcuedd[xyzunixgypmuhyj]loihlyylswpxtenh[jadvlnlzdpmoghiir]xbiwlfkwxtthlimngnl[vgtvhphgxfsshkgkb]vttcixaajhdcjnqx\nxxxluypjxxutqoozzn[gufawigbmnhtmwhcgry]yaldvqcedheoocj\nseczijwqqpigqcchnz[snihttcoqeotvsvxtsh]zzgbjkslldiespjeejy[dxpgxigvppgnnddyd]hcwgvtogqdyllyhkqj[hbkamssyyusrgbg]dnnseuhlwkwnycktlu\nxeupsswdnrpzqvl[tmaszjcshsavymzuog]svjeaxmdkgbimlv\ndktkcbqwdeomyrp[fqaiihosklfctvufhw]kscgwrylrgbrxjzogj[hqvwmstcpchcqkowtxp]xfooorpnwwfrqstxft[zclwozroattjxczqx]uwnclgxymympirm\nyohglmwqjxpcgozvfc[ojnlrvpzwcwgnfbvf]uwjufnumsvqwxpg[wrfczzmahjdxdzhifs]psipfjeacaysvubcqqb[paeelhpmpjlvbal]buinqeedxmiijkxpcpk\nficdlwimcpzelkxcb[kyizgumxqprpckyyh]lcwwypjwqbzhtozovh\nbycnifysnrtdseez[xombfbujijpsrccccl]tbvuubyduxnascxjkds[gteskflapsthkzigcet]otggllmgcgfgqloehf\nwvrrowjovflnwpjhhrj[dqfmznuqmmttqtdqnp]wevjmhhfmorcrvxvw[cnjtxcdcketvdidcbu]icghhdkudxptbdcdhik\nwquydkoyevtyfwqyimg[bhbhiqnxwfrcvqcsdq]hvcjbihyziwvmqr[phnejggzeulkkbdxb]uzpvcrhqhfkdkwvxcku[piqegxvplepyfjff]xqgfyfmlqqgcsnngmli\naiufvoznehafclsi[ynuiezokzxlhzsnlnmw]buhvbbmikiczqjlfhg[qfqcudscoobzjdwfyu]dcqxfcrpnhywlcabobo[piypuleecpciydz]xiendyljklimrwaexac\nbmcenbqijebgornj[kskdxdmdlojqtjtw]kqpwfyitjbkfubsh\nwjivpitbdiigvkhfpjf[ijhxqgwkoctfiyf]ezeuczihdpeegpnppj[rdcsrurelstudtzqv]afvyxjglfxybwff\nrypyyznanxetdychyd[srdvpypvsmzquaeec]qzehxnsvvccjqbjres\ndisgynuubaeuiwg[qhmjwkqbmmjhjze]zgunyyctwtucdho[xljnbisahxahllyiob]astxdjwqultlphiijvh[zmhdobafwbzdndlrm]hwcwvfxwjynbaxidj\ncdhvflnylxmmlsgo[oollmpblrqislxgmvvp]nivfytkylfpufcdxun[bocnmaazerwhgtzt]txxystvwvrsyoym[iafzkvskmhqjdtk]pgdgojbemypqbkofwf\nsjtahdwpdhuosbqyss[lopwkbhedbpxtcw]bvtrmrjxtncfnrw\ntdofrfbhpawcjokb[ynloiqgijuwanfekxsz]fdpwynqofzqumlrelfr[orxakqzzdjfnzlgywae]udzboibfngqztfguv\nhuwdaehvnyhbowsp[kbskeavlxslbvco]sekeunfcfnrsjqgqpcd[xrfzxupwqfrobegw]ndphbckizbunwqmykse[qyoqnkrhdydzuir]romctjjzwxjbxyqm\neyutpqnxiqygxwt[wxsiplbaidmlgph]vhlavtrefmbfpdfbju[owuuvbqjuailmgynkqa]setuzkegazwdjyzskty[oaqtnegjwglqnyw]pyizfgyjbebfacjexkh\nbxpzupefyifcfhkv[fyllboalhcmvoctf]bvfifvthhaovzixpx[vtppcxdmlfbfgvgolil]gtyweatzcejbwtse[prplzrovjaeczsyxc]jkylsdulnhfilbsqh\needtujnpvzzzdpgfrm[uopptnavfamhccc]qdnckczikmbwkxfmst\nhzpjojvdukrnakxzkdv[gychyosqibeedkj]efhirtkgyzjnrqn[egmuiotfolnlyjg]nbleytvfmuvypkpabt\nxadnnqlykhisnky[hvfudohkwpthdtyxe]xumogpuzbvdpbnapcw[gaavnafcpfbycdpvz]xlgtfefhzyskqazl\nohnpejtztddevoitaw[hoixesaghtpruyayyzu]ksyuxpootryqgsfctcx[yoazsorvwpkcrjqq]allrvqctxxhldwwzil[rxxioewpnqttrzaevnw]tjgvhfbpninpzwvxtl\nqhapfqjbpzieybx[iobyolfvekomzeelsd]ygcprxtqzmwotja[pheachmbpziycyhykp]yhlmlzbdngqpvfcjt\negcxwspabytsgsbam[hewsugjwdvnywgjhrsb]gbxbpxonzzllmmkags[jylmvbwwjvmvkkgvusd]fxckijyjjwfrmlzp[eiohquiromkekgsbp]bpimyywlklqwdpfasc\niypuotjzbcsafzclwb[mudgawqgospvlepaexc]bsqftdoatnacbnpqk[bxaxwphnmcxlptaz]yhbsqduzzzkviyxmv[cfeyjhtefuxjqndg]rknngkyxrldxnqxfil\nepqhofdmbeblgqjcpan[tuffplppwdkoimwbu]yiyfzqemymmtzevrvtb[vzuuiqvvudpedkbdgq]qzkbzuuvgzujipvh[etjfbbzkhkhvlslkjg]sqkdjmgjilbpvmr\ncukbhochuhppwcuwwh[ziuieaxmtjrcovi]egmfefvbqztrinknvh[tcrdwnuqobusvhhhuw]llwltqrtuzujeuatp\nuegokkxxfybcozva[hwnrfpsyzbclsubdc]kxssypkvfyghukcsted[uvtzwttuxxztqwwyjx]lhlyeezyttvgxgtz\nvgriivdekqhhyzgmc[lkzxlushgdqezkwkbv]aqtzbkzcfxrkuwkw[aeubxxnhyhlolauhnu]qphfpphyptbmbvcyutk[xscabrjhmsfredzulrm]torgsvodiuuxkgcp\nblygklicgpngtpgcldl[melaiuchcudinutcx]fldhqlhwyjqhgthjsrb[qnvfdzzszgaedjqky]amhauyjuhdistfgbipm[irrhdtrtvlhanuhfb]cszydrvyiahzwegkdiv\nyrncnxrkuamoung[vteffidkspotxmwhna]lohvncugddeuevq[ueuixhkoouhzzfucs]xgwgddhczhiovgacg\ngowzwidadczncgofqsa[gzkezmlagbaetlf]oochwgecelkuokyunem[slzawxgblqhorfpezd]chugkzdgaukccbeoi[apmckbkkvlblsel]tokgjnxyppksnep\nzyqnagblhgoyiqihy[oisqkkmqfxdtvfx]qrpxcdxvmtlqbgvm[rsoqvutimhujjhbwaf]xtdayhoscopmejfxz[sqcpfrehprvngyagm]ecwgbravfceaajqg\nnntkrxodbypdodgtj[lnlglurkrynztgae]twtxdcskknbsbinlnnu\nmeztofjunuxbkfx[cthbsibrfgxjyjawtv]ujhnboyhpoyjprrheg[qmjwvltvyjgntydrmeb]dsbnlksebapwyfrtr[aoyswieertsyvbfijuw]wfzftnldrfdpnmnn\naanwuubqnptyoryyrw[izbhposjoffhknmia]pmpudrwiwouwspqnozk[sojpnvluazibqcqkw]veawduaoceyxmzwbgd\naenjhairjysyrfylli[ksygiscororwmpcbpl]mdggayipjsxxfhz[zrovsdxuwyxjjbfm]vpmedxtfdporoono[zfnnenxocrbtapmnezl]odykztbwvuvlngxkwm\naetllelassgaxxhspd[knioznfojvtrwjtnvfj]zmdmmmgudgcrchsuufw[qowcvxqgjaoptskz]qyrfhavolkmidaul\ngkevcmsegjotmpa[yjvykufplocymkaq]yhewirtmatswhjud\nkaerzsgqzwhdrlzk[fgmfnhjaylhdvepgdr]smkwpurhnnhaqccuho[cznwafhuvozqolaruqx]ktiyadiryeclynr\nqnfeguqpvoiadeipxs[tuodvfpmqdlndroq]ruumxxencwatfiv[otgvbhlyuhtbtyfews]swsjtpcysedmpsgwao\nmpxuvhlsahhdmtwlhz[saxrupcdkcfpmpvzk]rctxchvmeqnqsxqizr[isqtziiuucctgioof]vdlchnruvtuupzvukfx\nczxihwpinbwjaatnmx[quuiszmtsnqdsugbr]fhhhwhvrnenwekmyi[phwhrltyjkmdffqyu]woxrbiznmygdqbptf\nqwqniztrmqkkiyg[yvknzntvwmikawjlgh]izdzijciztugcknoi[mqpjeordqprhefbbsdj]rtwjvqdagpycdsxtd\npyslrefucxvqpgtnfd[guaqdwpjlwhfmmyzxln]unlgsygdedtpfrpz[uxytlfxsaeouxxdpdb]ufpwpasnaiqyqnex[kiulyoykitwlllexti]cvxikzspuywpgaud\nrbzuremuvpunjopiw[evldkwtjsfwgvdl]unsafmnksqehiore[ipvgyeheeuobibga]ohwjoehyibiihubwuo\nzlxdszmzwikrjfjfh[rmzbjspugrnhysidi]impguvxjhbhtirmdihz[wlpaqqnimsearxzka]fftirrvfdqzoyusjucj\nyvzxaecltitusbcfqv[witiggtqtgarfrq]bhnbijcfbhoqpojeuqw\npeyeydbwowzleyebpqs[abxvydhobwmlksefjy]hntuuskjfvsfwnmh\ngxdajcawzfzzhjbzpxm[nxdsexkhsbaviwzw]kojsiljoybqxuvi[razmescyfxecbmzc]fdayjgkrzsmzngiszt[sdqgfgolavfqmuzqag]uzbbbcwcizcmhntiom\ngssllxegqicytbgko[imezntkypaaclprdo]hojadqftyszdiohirac[wcpiroednqmsrywvxsh]gkfmxwfuaykpwmdukm\niwdziuryoqkhqzukcbq[qdoppjrevjmjuod]jewewfyupjnuydkn[ysbuocvxflmhbdhlb]ggjdqbzqfekjbbf[ubywismzabwewsrl]fufmyromzqrxtxsijkl\ntbmlgasrsqjxwto[mvoqzbghnwpunzvxu]wxnwrrzdalxjlflva\nhlalpnzdmwlhuwewel[uqawlldafxwhejwbxj]vkktsmliwswarsq[isoseemfosjusoo]bjbjwogehxaqhasloxq[oktpqmpxmsnvbnsubz]ekgpiztxkkuvpszb\nxfxkkivnffdwrqecja[lvgeafomwyqhlfd]uyvvthewoyqjyoo[dcoayhnhnhakcuv]sfucrodbqeqcqhpmc\niqfduwigwfxgkhbge[qojiewaocberonshm]toxtpcpkallieefn[swenxuejqehdfutw]oaiceeyuhhzpazuyaiw[gqbyuetdmvtttffowv]neqopgkvwqemnrmauc\nbbwxyipchypnmsk[lefobpxeokqvfglny]rwdgvzdupkxjhppcqp[onrpulkcgonndkfq]eegboakcdoqrmdgfta\nyxeegoeubfjhijn[pmdjdggehnbtvfqkdk]ofdoklopgeznrvssgdc[jidbyndormgpitjsl]ucucnufigpzjuuxdq[phajlefstzyysdkdrh]vziqmjzpeeqnqholz\npnlllqydepsbgkrhm[ltoscinqrrvkdyusds]qwwtxmmexgsfqgoh[uucslmiboquvlso]xmbeigfpdmodrodwbp\njatdtuzlcxvgwpryf[dvyuqxhxkurrpblehq]vowbsishfgkjtvicd[krvikdxyqlwdjjnd]mujppmtqzmeviflf[ihqppwgfywzrqyx]aobhudzykvgwwhirfiy\nthmdermwtxojztany[xcohmubhlagpuew]lnlsiczemaohvjhhknx[spnegzrtgilojpnoxs]spnvmefqqzpdfzset\njccjsrpjiyokryde[gfwdanjjnbycygt]iqiuzghicmveelbxp[tzugzompmkteyydyeb]bkvntycebtvjlgour\nrzskdzdoxsdqinbmjlv[fnwbduvtemtogsfi]oayebzmwazggkoo\nhzpsgtucyxemkvmfxy[duxikzpqdgcmkbl]bluegvpkqmjiyzibglc[qruyknjgybyboyvmrsk]pqyrdevwrpeatgkyo\nuubdyuzvtcfrrdl[stntntweakppdrbqk]yoiwxzsdefzihdnilx[vvvsontntjvgcvanni]sqdbtjoziwfolwbby\ntdpetsinuufpbezbgpt[hpklzrbaryhnibm]ucetauqranqexnfdstk[sadfrrjazeweeec]jaozzdmvmylzatlon[gyrmfjwewarvlpsh]wfojorkgrvraihwpaf\nsarrhlzjldgzhyuvefm[braqtukjacxtcbrgtx]rpfporiksxcacot[zezcjaonoyzxnbgd]jmrjkrugljonkzb\nhclqtamrzmzkhhwcd[hcxqnplterhqgbude]kduskujldxotldizi[ashjjijtmbppyhgxo]ozdvjfhxmojeqagmoa[dppzupkveblwydh]qonltaesyzvczgyng\nurvfscylyvpyvpqwl[akngblyladvcuwa]pauygcletxnisgriad[ovsqsgvuccmdzqcwn]jjugrvjyydebzrjghae\nohvihbfwdsvpzohtu[qsxghcyyscnxwgnspni]kxlgrkvsbjeomgckk\ngzywjgljugwxnrv[mssfmontfbahkya]gfmnxglcggnbrpvuxv[poejydksxougrcw]tiqmbdmjniaqnqgptk\nhillvlrgjsewmjkoha[iighatessfoqwexqdc]iqwztbnauifcazihogj[xgovsowyvdafqch]qfjgljkcgkdmrnlrrmv[hnjcrfgkftyitryole]muemrwwikauccsregut\nvmdrttktgqkyovr[myycrednrrhozjdhiog]qrrfvxcqpthdfcls[nipthbalwkyqrmqy]xaprggoudqizdkqu\nofmohzqodnueziyemx[njkghrspckzhduwsrg]fxxnmxloclzfmlkebpl\nnaurkqfrkpbbfkmbe[cpttgjergcoemawxjtl]cdkngakkemsmtgtwyzn\nxtwigprawkooqitoy[dzapkodeyqhkixy]zrtxkzjqgqeuagdie[vnieacbchbgexzaf]ezbpshpznqosvuk[mcmcfwuzlyodiqez]bojvjhtatwvmxsxhkbs\nmuiyjlnqtepriyly[cnrfxiwdlkrqsarpc]hdlysxsdtpqxquhnz\nclmaeawlvsluxfrhl[rayxcpbervctzew]syqcakahftovtzcdl\nljjlywtzejfslouih[hmsyjqsqljnppyv]bxdissuzzauueguk[xhyiqeotzpbtzsrd]wapoxmkfmxhbykdv\nduvdnbsaqzqemzc[kfefbyefuptincfaw]jhuvhgdqrnjwmlfrmr[niprevfcbwagwvewhj]hdhrwocbqysjstefldo[uelmkdqczcnlmaefjms]bwszcueianjsjhiywwh\nyrfewhgpkihnhct[pxzsdirhdakahwdxteq]ygayoyiuikakdqo\nwjrmypbsxqajzbtwl[pvltruknhkznchej]ypobvzyforzyiihvzq\npdchmvgzmxaspkcwkpp[kekolrkqgqcekeitv]xwpjbdcxgoelowm[wxdhdpqotthaeay]ovvuawitaqelckg\nfcqvgochyglldipl[ryndsmjdhqvikwnexf]smwbuebgfzzmfftrdck[ynaegesquznhgmisvri]hwbktncquitjaqs\nhcbbiznmlcfgdfjtgc[xqnepuustubktgck]jspcsloqtblxprd[mudjqeoagjqcfato]vgguzyxablhnrlye[rvzjejrpykdzzqcpgmc]okcylioamjhremephbh\nihlcdgalqwvznxl[afsqmxduvmdjftmrjeq]ekvaovqjvajxfdutwhv[zolonpiqednbtfpsrh]vurkbqdeglqdsml[jivoaiwnfpbgbzzc]neycassstykebswqao\nbsgrhhzfgwsgzowrbj[mvkzjwkxsuwxnioolfq]yobngzosyzkmgrphxc\nedoabezjjyzijqbgxup[lcxkqejwnnslgykokx]wihvmpynxyyhaysxvrq\nwmbgvnekkdivugwirt[yuioeaoerarbpcmbwk]bdlohxkfgdbthtxlc[zqpipkuumpyyioewz]xssqnavbegcidoenex[xvcirztjwasastitiy]mmcxttawlbzdztesk\nfmfwtjsguazrodvdy[uuzglafbhjlwujwr]rjttgtqakbrloqs\nmjtlntwhjqjoxsbhk[adswsdpwqnvqtuj]uwzfdezklxcvhvhb[rzmgufbrcamkvsl]imtazflkqvdgqvfthc[pvktfhdynocqbhqb]qjtlmgsjspdfgoazn\nhfeiexxrkdehqttaam[uinfvckvhatgmlblj]rhksgzqfcizyqqx[ofgjnqhqhveobpzva]qaxdjvvaibeenyuzpzl[ktwkynazrcnewdnb]yzmotgipaelgbsahicf\ndjhinybbfbbvidnyest[zougucdzxpenqpoi]vvxbocdotanwdrjks\npoulgwkphlvqfjplgw[enhvwdoftxrnowdy]jfepitixnyjgvvl\nagbtjztsonrgwzivf[igqgvjqttujviljk]pmqphqrfzfdiinxhy[hjpgkjjwxgfsiki]fqgfwrylhecwcoowxsi[fygonoznhkmzcjcpm]nwouwxzbpqmsxnfhedh\nfnukiqycmrzcije[optroggxrsbsokabplj]vlepcfzbmvrqptyx\npdteouejbrhsicugggj[dipcyddhrktybch]rsynpfyiklwyhvlzoxz\nyuxxurstojjfnoft[obornuhvvdtcyzj]kivbosojivpliva[twgyjecwqsxjmgi]hbphkpnfffzpbwjgf\niuauoxmsalkxobrgb[blehxxupivauaxkahxf]torbqoddhsksgtnps\nsjgwxpuwloyujust[psqoquaifhrgmah]vpaddscloldhahh[hditsfewhihijrpf]ofjdasdbjvfrwefs\narpvdepqyadnevyphg[kbpdnghrphvogmn]wrzcskupnydzepdmxkp[beeaeyelchimtyrq]yppeqczzpjsntfytp[aofegesxpscjbehmcr]wkhyeeykbgemqgcynxs\nouluccjlcbcurdpkzg[flulmqooipvjzhip]qkxrrgvodksuivbspr\nzfmcvmwchidwtgjmpoh[ecthaqwuytzvxcfk]pwvwrbzdjqdtxlq[fwbcqsvdosnolronvef]sbroultaoabvbtvh[ziihpfydzrkdqsz]uydoxylhbdlicydahf\nwyvxswplnabvdoeshds[zhrpmmoiilsleemryd]pgkwuzialwbqkiw\nehkebgpllhheumhf[pfovxzqmiqoxdmywhc]qpzsvhisrjgjfqnliw\nbzizropqhokoukoxz[ahvweuhqlrysrwu]sdmyzgqcevcixtomzch\nkfyocamgrbgzslp[bclztdzvmbyetlgjk]llzxtjeauatwnnpkrvp[pxshjlevsleipkfkmf]xblovddfkfhviqulap[zhqfznscbngsaej]rjfncwzuuqwowdhfk\nbiaunelzsqaxohte[zyqygmhjmwigxsfi]lmdfmblocglcxaszya\nngxgqwjnobiygnm[jnhtcpyfpwpwkxapib]lyhgjgvcuwgbxgxwn[rovvgibkfcahiyn]dyojmojklujquiqfsj\ntqdbdrqgfyumjwktbg[weesraucasfagyailb]ilhskphxtzaqesynmi[stfgxrouxicascniwpo]yfkxnhvrwkielncq\ntwgbfgwbpygvbfnyy[xhwmhyacxxleyadli]wffogpkjkmysxzlmpuv[qnjizoqydldcwubtux]askyjzovxsalrrgo\nyunqqhjmfpqqycv[vamwyuzotttqgdzgj]lmuivwjmlbeqkay\nqhquozlhiohsyzwv[utxfaionxyjgcnpulf]nkmfgjxfobxmrydyic\nwehhwiznslzkyncnkc[dzxeftrnxfhrwprllke]imknddjnfrzanslzdz[dfqldjhkxhowubxs]ojzmgmludytadwespep\nrbkqkcqoxrfczfwte[poemreldxewfaif]vehqkzgxcwmvocban[ffpechryektpzbdaivy]emfkcgsqpqkqxiitol\neidbkaxexnexudiembn[xyiztwlbqvoavomnlwv]rrfwfdixzpzvwkhwlw[kjinrqheqjsynha]pilasnmhghvvgaxor[nrgzhlsetahyskduscq]uazoholzvqjdaovgjr\nynlcechniybypvzubo[fupezmnrswguyjysfj]ckmilshpttvobgoux[hybhkdzvvhelhyvoynm]amrybybroexntrlcmvy\nqpmlcmgstzjfincjh[axvarrnhwnkyucrz]wbbpucxtqbdjxsug[tutypessbhpshlyt]wwlkakvsggtbzcz[rypxpzrrmmohyowkja]aeuhylvosccpatslhp\nhrdlnpgexbirsepd[waphktwkfccnylxg]hgukjgxutuzfovpazhx[jzgspycuftkivlpx]bhfazqqagtfpljr\nciyqjrkwqlwtuhh[lknvhwchhuntllyvjb]ontiepkrlphiydhyir[pdcojzrccoatarrqj]rwmyqonvfiexmbnjy[nhknsnxkwatatfhwa]qzlqiiovmuukmwypy\ntjxbenxjlgozxrtqdp[fqimqatlktqjwjdzuoc]fedjvxnqivqaxkvcw[lskccrwcsxulkabzp]orszzlxhimwlzfawjw\nyufbensvlqaxthui[vplidvdhajkxfkledbz]uposqezqxglywtlxgg\nwacgjknueqomqccqnkf[erdhexyxtcmmvhums]bnywbavxkfzbqwlppv[bwdbqoqfxejqnsgjd]eafoepuyabzlznxw[etyfwvldfchsrdsjyec]apzomripffavakswd\nconwdmtawpjnzrjlkrs[lfssaruafijkmgdp]izwehdqwarvfgxi[stkwrpsrwwucxlrpvd]sucqudlqvvklrfdgac[gelbgtycawlilemxamk]zmdjppqtsdlqfbhmm\nufwwjiajxhcorfa[hrdobejvqrdojftlnj]vamxyyehcgnupky\neonddfixsvjssautqun[kktlnrsxhmhwisd]drpflrvwelqqmdrcleu[vefzppqxcrtevyv]yeayirahatkufcjvax\ngipuuaoxlxfkqld[kytubcrnjxvhdxjto]kwpqrvvtjopyigmq[urijeznvkopxtgkd]infdbnklnolvaqwwvo\nbdqprkxthvsgqlp[qtcbdifrlnjdpxrb]xqmtwugptmssrivqb[zlkwptpsqnljxxod]esxomobcnfjuxxdmsmc[tifraqareavetzrpw]dlpsxjssqzyqwhd\nylwhvgowletbcqjgr[tnhoxqhrnytlbnwifx]pyzwjmotosezztkqd[ejfcslurfhiompqindp]kvbfdwfmwkiswfm\nbqlhxpzchtvwcqc[jhpqckkyntskugvua]ylakfwmlerklrxq[wjrmeexzlljednrxho]rdobmdgxkucmdrk\nehtqwbiyigxjvkp[qujbspkhxogjrzskfm]qebesubhovwonqudy\nsjqrkysnnbgtkhwe[ibgrjvqztrkknsr]mnbkbbxvfhsihzkbsqz[hxxhvxonqzrgcant]kbkvnbphoymseakbxjf[yjkdvhsscxggtyyk]tofzfukarcsahrmvs\nndepmgjnsgfsttp[rgrcqahcpnsyknjkd]uablhivltavxssnx[uwjmrokgisrjukeoh]wollclyotaektyjg[tzbziofnztlojbros]qvbgoapfzbecqwjsq\nlspiukvizecamzh[vgaxbxgipyodtbxb]qpnkwuqxsgnihgd\nkhdzfhioeykvnvxuhic[lhfxiidbrwldhvfav]rwxsfwhshazzaxvk\ncoaljuoxfhvirzhedxp[femqrflktuakhveiiye]iabhkrebiawlktxmbr[pzvgzzcfzhswxitunrj]kqpbmoluwjetvhdcr[tyqdtrnkdmvdpuf]skrdeadiylehnbiyvws\nqimxmesehwdrqskwitd[nvgxgwksihjcplpl]bxnyyafyzxludvyehd[hswtrhxmggpcpcvew]cucgudrfxfbietibgv\nmoiyvifvvucewfqu[wuzvazqcictmsbtq]nktfnkfjbsejorafo[vfreizeqljwshfafwdx]xrtbsdzcfkdmskiiuwj\nkchuwlbokzivzlzvib[izbibinxysyjrvtapis]vugjoxtigdmbdqjn\nxbclcahcqnbzwpvshao[qkamrpzzmssylpxb]tjsufvzaorutvdu\nhraytavipeznkuoi[jmllyjddfakuxwfsx]ofoxhbhnucmiztrtcji[vebzprplbxwqnzllu]peaegqqeqbjikxff[jxzebruqgpoqmklz]liakpsmvutnpufovqlq\nomtbdjlfagkxdlntz[mhwuaqvyldixapgoaec]aghmtjapinrxlvem\nkbvvqlrdswbturvx[qpkrbbaxhpljnhlytou]xsogoxibyznqcpqgygn\norqcxbycauryvjxq[ijorpddboqkyznnnm]rvildjpthqvtdrzcq\nhvttzyckbqjbyfdn[lzeulxlidymszjl]wbbmixifmqzkvypqola\neizqnqqixewedcvcit[ohtuntptfbovbsnl]uuswevyvyulevsfnw[etmfugdbznyzikdtx]euprxmmhcrdoefvfjg\npvxjhbwdlshqkth[gwmtamzhtucvbkmwacs]uyephbahzeptqmif\nzitdlkpouvntzndz[iluwraejfdnwafe]fuevzmqlsflfcht[suumoqktussjsze]dawzltubgawnahpd\nkrskxctpuowviqiqxu[xunkhvqyyqiqhyx]rcdhdjoqrutobnjpimv\nfrsjlbcvuwydaobhii[bdatbysbolkcpzcxoyf]lwsfakbmjilithjrls[fhozecjhruquesmkca]oorqtbaamburjorhy[occzlzfhekgspeep]lilnnsqheytwakzah\nragajrztetigfkm[egetcjedsnrseahrxr]cblhtdmtcnoaank[fzhqephlcyygbwt]uyqlhhlhmnfyfcts\nnklzxesmrrdlzyakdk[pfexuhulnvbmndvyat]xjvspjnesqugmkngn[vmzvdrheaknqmzyrc]xfncycggjiaqvirfvnn[aqeinzmbaijlafd]pjojbnvismokshrs\nurteecaminrqiohs[rskgnsdfpksfznqpphc]yaxixbacbtysdrnwixf\nibvmhqpmnpzmghdtdpo[djdzntakacvezlr]jtdoweayvyiaskblc[qhwimwixemjmqsu]rzekezftftlqqovnq[hzeyrnhbrrducxz]ceiqewhcqqmqluro\njoqwthpcrccoovxrvq[qjlcrltwaxkjenbbql]ovebjdqfnfkomjpswn[qhwrxhvbaattcrkvff]nmytfcchpqktagojhtf\njeeuutsrxjlqegcdlrm[chrtabpzdcoetzoopc]axdhgbwmwhhlrvc\ndjcujdyidkcgwygy[zfpuoobkfdetgiifrpf]uxzlkhxzqgiuyvuc[gboovijloiwizfuuye]wimticbreszjcpsls\nylpbdnvjaavulnhg[novahskycjcruokxbrc]gzsmxnvpupgxwhx\nqdarjsoimlwxduyp[nghlzeghibocgcbhqb]vuoixghxxsxftuztlxs\nikdnbajyzpzbtzjdey[fiygpvlyluerdjvcdc]hheswtvpmtvjochdsih[kmjnhhmbpokaxsrf]byzdcdlvgyorjvkujyl[ttxlhbnifbfgmvs]onytmkodkklacgel\nrcpgwlbaskiorvxhgsb[xikxwyiageqvilea]rhkkzuqtuxbhuygcxya[prteqotsqfyypus]mpdedamsijgmdktn[ptlcxgtlxfnvychnwe]mdjujbmrytfbzpslad\nedjzqlaktolcrbwboup[bvmtkmfmidimoohq]kpsgyntrgidclnq[ohqjnvirkjlmztem]smtywugfaobbpvmzj[aksdrqczxftjrzuylmm]ffyrsvfwtqlmwbw\nrkgutyhaonmyick[udryocpupaohqhrmmsk]lmusznhxbkbagotha\nebtiyamyxtfcakoku[tfggedpatfzjvirou]iwbguywvekoline\nvjyzycrsfycfrookru[iszkkyvwngsskic]bnnqauaqcfxctnyofoi[tlegfofrqiuqlgkld]biryppugzufezftpjra\nneipbfcjvrnrmpijwhq[eppjsmrnolpscnfowe]crsmezklwmkbysajb\nquwdpyfsllgkwtj[ercxwsjcfkbpohokuc]isdjfklflnudrjetf[fuxsclqmfyplxxvao]xflfujjqnglxzxlxz\nvfxrgmnvontljaodk[pwtwiqibbceehlnhf]lwzkbshrmagzhwqyq\necfthornfevsngitzhb[pblbvztbbsbsxxuwec]jtjnnhwkekrgjanoxbe[osbstvuwyjietzx]xiordmxphcsjnzfnrwe\ntcnlllsrvzoxupp[ficwiahpzqtauuk]whxfguillhkpxitoqq[ovsdwbddmfojvkqrxb]bfagfcimddodrtb[lghczsmdqufswoayezk]ctkmauzrnhgotbibbb\nqahnaxgypnpjftgu[bghbgwqxwfnfrcybzd]qinmtddfxbpkhqnna[rheeshzhyxfbcfxkd]awwsrosrkyfqcvtx\nsiffwvlfljwbcndns[cawuqwatfhgwsphjn]twfwwneebgzxmqyrhbr[awxuvozbhlohuaxim]dykizkumcmmnwiwdx[dikxuxtmacvaxiwih]mscklmepmcgjemwtvv\nnwnwxbeggraucwj[ygdjhwgskclfginltdy]ngfxeqsonadvobrnwne\nceulusceecbvzesfpia[etyucdrmmbsstudbfo]jjzwvaqsiovrgro[msadpldzcxurzije]mjrrrqwmyqxpdgmp\naiwctbwfathsnst[ymcmlyeojcaokgf]hchdxsyquapjjgncfq[adzpesdwzpvcksioys]rbfqvkxsicnkphd\nhnbounecoxhinavuro[tdytxmzudgjmyxmm]fovpxazijvtvirqfrup[qbfsslqkpyioabrzhlz]htlcbtysbfxurnuqgs[nybjnpqgugmtfculk]zxdfwtbtbvhxyrtcodd\necszlqenzswzeujn[aymhmhqkvzbuabtr]qasueshfbfducoit\nbmvypnceplfbhhsko[eypvaebyvggpcmzum]ycwgnjvrjmdrkiao[hdkledypozrgbkexls]isuydppzigzqtfo[onvsgjzwozxcvgkukez]uhjisxtizfjiaebue\nljvtminczzipicxg[eqfvilzenlbztef]hpdptelqvvscyfqjbk\nkofmsmvngqzdobeg[atcxvdptaufgfpec]rbyvvgagylqgryjmdz\nqrqirixxxpivzyxidp[vanhxwefpeffrphvwm]awiajngjmxhscxctxt[hnmowanymdizdow]lqjbxcvbswqatxyp\nbaeknzdxlkxorrfi[tiqhvwvqoyavllfk]uqqdkslrjsueklu\nusgfgiqvoudfsdyov[unqciexsmnreobavmoq]kcboezrfdmoqrgg\nxrqjdugnwddstnr[gbnpzkldpjyfady]edvtrvipwheribydmaq[mwzdiuqdstogfjy]owanzbjqvaqgsgf\noumjseobbaxvipit[ukwqpfaqohsabpd]twomizennyccksgi[hszmrfksmdcycyda]connwmiollbtvgh\nskyizttcnisqncq[lcxdhawnbdbcptj]ocvhdptvtfnwqcdmjff[sqbbfcaufseolqwcjt]xlnlzmuciirvedlni\nnwlhzupppktailtktkb[bzdpulmwswdaqrv]kncfgfqmxoohevsxfp[vgabgahytpqzalhap]bbubtzxxzeysqyqp[nhpmkotpzfifrfpmk]fruxnzwuvonfoxc\nyedymyfylbzvjfwst[woezxcgsurflqnrmvt]qsiblcwatgywwbktdmh\ngnbeeaxxlvupyacdpl[dhgikxwvtnhllqs]dzsbgvmgvhcbygjkxz[qmayyikkpsqdoukt]kdfbifunpwlbhsh[qrqskqnysxtloxs]zudxossasajrdeanct\nrhftgsygepdspzqbewd[lcmdbukbzwdesfroixj]oblwwxyfconxmhefjow[fvutwgcvuaemgzqanrz]xtiuegikggcimaobg[uhqwmtpowirexexim]txoyjvcawbfxprxf\nviebpcquqeagmuavf[kxfkxsoijrjklkgtahh]gdxrwirjrvzjcykax\nuptdisvspkluwgzkti[omvlmaxnyxyzwuian]pmieocovsvpfcveurx\nejmnzzuuduhzoze[xrdlxozvhgiofrc]sxtycslunhjmvejtkd[pakbfwkagujukiybe]adudpcxmlamtkwak\nlqyqdhuldmtwbvydji[okhzffzbmlvqiko]wdcicvzpzkaowwqnztt\nimnhospjiqsxihx[utoykmsvdetrkdxvzti]zgdfvtmfjggwyjef\nlwsirsmcseswkfxh[izotdhmoodsvpsp]jivuksxahorpwcgxnn[plncjtzvyamfyxzst]nnpdtmoozfzuemdcenb\npuavooykfwvhwzmkglt[xutftanpuhgsdznc]rvzdveoxydbctczqu[hetpqpdgohitmgtgyp]koiwybsyijhmmqxesqk\npuivygxavmlrxwkst[qvtxsgezqcquyae]brdptsxbxnobkvcqclm[ibxfeuecufosgtzhxg]vziaqziqriftdfrpnll[bjfubyvxxrbsjbqvi]nnlbiuncvdtnnarm\ntlzooyjugzfsomi[robsmcwkpeprtatddr]taktjvhztdlygkj[vbjvzeeznvmamus]sformulcgeirdihntt\nzbcyicsjcmpicotmt[tbrfctpfnqspmvnv]edzcoymhzfqwbuyuyu[jhauxxgwnguurrviws]rfkagjqfdvhjiavoxtf[zdejarfvfodyslh]pzjedvtgzwflpduq\ndhbhmlhsizoeldofqs[qcypvphfozxibpjdo]idntecorhucvlufrwu[naoixcxuqlgsytnt]ehsyusyugbmahyrn[djtckrolqitsztwtuq]urantneyeodhvorgsx\ncnsrdanbfjubsdd[nwynwjxiyygvgdlx]gyyuqjjvumvquvzib\notivcdfzmsjivefwujc[yiveblxrayrkmfjwd]mbwaroznwihbnbmjp\nfwanqgdmtlsezhtvat[bhxmmztvspchqvhovae]cnjyjntrcijkmnjwnlp[rziosbsufkiamqmqnmt]mvxhzoxxibbkezhzlks[hfessxjoefqfbgxhc]kdgmlomxtdfgdgku\nygxiiehdqiqtqjzj[cwbddmmlczrgdgpibge]tartaeajmndarksakye[qnurjchyeijxcsdpc]uguxoncwdrojsyszsib[mlwwasmjacumzfqr]sguglzsozcdjzlooexl\nytyzugjtaxtnwxkns[aclewmcdbbbwyyu]hlfhrgrigvwsdmdethb[osohbeuazmmffxyeq]ygmbsfwcmyqowdvh[pqpwyutdqwwunfqt]ppkundibovmqwjwyll\nvcrftmfliijtpaqsoy[zcpypxlyshsruwbclj]mnwgypyvzdxnnie\nfmfdmvxkdupjadbxh[tauggdjujfbeogtsgzs]pygzoyudakrlrlba\nysxiybmwpoygkyle[xaaughrlqulsertp]iukezabalczvwieegzj[wlycqpkbqptraajl]mjevizxosnolkxnfwxc[veialybabbpytrf]tpgpqighdqgphcwoysw\ncnxnptbcjhgrxrtremt[tjguyerqizvuobq]honeukqpcsoiapswdgs[hcroutdslvvzypfklj]owxcxqehkqqyeflgi\nypgeqbggpntconrgr[fmsyjvaninmkfqekne]ykrmyjpfwlhnsvgehop[gvltviftpcixosamy]xlsyzevtwaokuvneo[nbfcynlfsbmmweiml]nxuzmhrwlucgvfy\nzagsvkbkhcrkvnukl[pyfiiavqjgonrarga]antgzbmtohtndzgf[gkvovvdgppcnyjifrc]lxdhpometcwlkofze[fpxwacqdussynpwd]mymrmftjovoqtkuae\nxrtjipuirgczdlrrlnu[xdczaqvzsfgavmzq]luocuzuztdgsyxbcy[agpcmbiyqxfntvnmzn]atjschwzmauidumzxru[gvmmftvwtfsvudtd]vhmononuocptbuvorau\nfzozmcmcymohndlq[rnrgxsywctnmxxd]unfjafhfgeexfykym[xnldroqvnecyhhcwel]wagagwcqljxduzebjeb\nefvejswssxdrqggx[iqwwyhgngmwzwsw]dlkdcjxurmpsoceomp[scbledaqpgsgynjo]rsdxazcyjgcubfxlbb\nrlkrgjrxefztgtho[tphpsircgzsauqfew]ridnbmerksozxzwx[lcqwhfgiihdzgtgudp]whskzgdpjubkztb\nqbtcopfgkbhzhhglhh[ostebaqylyggiyfptkw]bbuaatfqlpxstpgwg[nydgrdgyazzfwlagrz]fiiddplgxeyyntyeb\nbogowskdtwkyhtdpzw[uxvrferconwfnnj]eukencoekwwahhefvs[xtrpjeahwpxbwgogfmh]axqvtgibzojnfcku[zhkpmdtwlogmypeqc]jzqywlhocshrdrlgd\nrdmpdlidbkplejoikjc[iqzadghltpndooanzp]ltizdvolnhagtlvr[rqcrkoaqwfwjpsrj]rtlcwqisvkznpvrjrbi\nndbtkvzkgjsuyfibsn[gbfhvruiotbnbtvuxaa]xihrrhcnbnowthpdge\nvxtgjsiuodbsuhg[updgogkqrntiedefvh]xwgrhmgmpzsxyen[tbhogopfepprmtewkm]fmrtnudhysikudz[rrdmqrctpwlcykzr]lpbvstnhcmvnfcpngja\neoaqeiqpsqdqkdvia[pdyuqgwuhxfiukmpvw]wsjyvdabhrdsxij[puikfklqhrmvfrwomu]zvbbuuromxgpnmpviw[fvfilnspmeoxozaba]yaouxfprxpkvkit\nqpaksrcracxnyuozqc[evqvzzqomyzwufkvxx]vmbkqqkzjskcxbmbbp[alqaapbcvzuxchmaa]pzxrooiyfqprfaucxue\njmjvvyxljzznmaarmau[piytxuyakxaropkfnfb]txaaoeuvlqiwynhqlt\nyrgxyekmldicpvo[wqcvsbptigcqvzoet]jjwvbjbshgmwttac[ymvjkuxxoojchqomnj]tsapoddljyrehrxrke[ajspkmvbrzxrxlpzw]hwymrguaqnefpsza\ndmlshfvkrzncuuoo[fddyurlzqbpqdidtkrs]kcewmacglikdszapy[fltgxlltlvysvylrl]rgovwrvccixdullrof[bqkrpxjupbbrdnahf]ebmiiwmxkutltuxwrds\nlzklscqfbovjmjbo[rhwheqhkaseohohelh]msyobgeiybsbyucus\nolbjozztfeowxftbsx[oefyqpxsebyfawerwwb]uyfpnsvujqenwouagc\nhwhbihujnzgayah[euifzicfxexpxir]lpgjmexgfyseevwjpqo[nniwslmnmrgybuelwb]khkudtujoigkyyjipu\nokiwsdqqwbijptpjzl[ktibxjcdrjvsgxzlgg]cimquzswgbhabcf[gictypilnrboctfwls]oiofteanmgnauid\nhdwokqbmfofrujxvf[gcrxxfsxmycedcfr]xwcmtasmlcvfmezvtk\ngcxgyjgbqhtcqznfuoh[yitqnwqdcpkgwzayq]oqbiabducwietmxira[kuxdaeohprtnmpfniab]wddlljbeofkomijydzt\ngnxobceomvkecom[oedsyavphnrvulwlqfk]klkcrpigniietqecrc\nbgzhntrrxvjvhyqhf[tnyvbggtjvjfgratfo]hltqszvzgcutrdcvddq\nsgzcemtrlzdjijht[wtvzogdoomtmhxcwckm]nmvftmtbucjnczm[hkqmnugntbrrsphbmn]yfvwwzebdqjkryhm[ydcjwepsqqrwnhkpup]tyssdovqgkhvvstvd\nbuhlborygnuuklh[haftitnpydnilqbqabe]gemzbfstwlhejmjoox[awjrajspxybgdkbl]nrkncxgvjhuwukw\nsuckcafpmeixlavp[ehmqotytcsxzagjq]vfwmytywcapfwlljl\nvblctxriewmbbpxo[xsgdnvmcmfnuejlrtz]iltofzajbcezlpy[wnfixwfqqgseisa]buystfqzokvletbzv[woumxjkmiqqstnt]ciarbpnsahayntnv\ncjsgiueunqlisps[zurvijydsqsdtktm]xhlpspwgqlwqfvx\nbobcmszgphpejiwlwdm[wwjrxebfctqobojw]hyrcpguihwihhpmr\njlyvxnexbisiiwyjjf[pxpqjtfgwysrewmrv]xcfaninzgmdidqswt[spnysxcfdiwijvfqitl]wigmjtxvsmwlquxew\nqqtluuthgrubwpqzr[kgebpbdpqekehnnuyuh]onnyuyxeqstunzueapk\nsizavpqzmcfexfocoxn[dwcfbufvxxousaeah]hymczucocssffcj\nldupymvmttlywlxbbs[vsttjksdhwfdxclitx]hfvkvgmtmaxtifvo\ntbgqiatbujypfbjha[catabtthtrydcjbt]aujolgbocqymyeqfr[apsuwlktuaukokmldw]qllsjhthoqdlpykgwz\nzqtpkzchpnnmyzygsaf[zuokmkcncefsioenp]ynympbineurlgzkdys[nhrjzpmbwhwcsuowx]hzawgwukxrerbljm\nnavcmnriavzmexm[xdvtpfcjdxlbsyenvtx]byqzubujbhvpwfcme\nkookhqsmbrpgpsbctfp[wlbmttbadvipoyrojd]cqmhhdfaunlqkre[gqmltgpxfyljdyo]zvzerdpqmktqmezf[npidrfvvtdeqgzhojn]hzehtqonmwoahdakvve\ntanngpmswmpddgfpph[egmymqydmigpnpr]bymycsueiolsfyfey\nuddmrzbeefaxbulsm[ieevtshivgygbvsiwpd]lbxhzadyduakugey[sqywcrjzoxbbgadoqne]xngapfdfzbwcrkd[gurtymibbzvsbxtpypw]elpexxrljomuxnybuxk\ndiqvdzizaoprrpzrovy[cbayiwiifklhjkw]somecbyhptpmhjvkrba[gczcezgzlsyowteraem]xkjkakyvwxbgmybzj[htxdiogfsahudae]hhbdrescqujtyeyo\nkzrqpxxtetqkqqfxild[tenlubsvlvxwjgokm]zxfixurqybohvhfa\npjhbxnktknirbwjp[arlmosnekoqwtpysn]hexsbuespjgsrzbvpf[vaacxsepjnqxegwqq]owuxuohhzxqnoqepvha\npumaevegtbjlzsijtf[cjpsnszjnvoexufcgxy]dxngvevsnjzsbuask\nazhhrcrptkuqsvxa[hwxldisbvxutspea]tiqwqugkmslokmixx[wzqlcgyfzacbyoguk]klpprvhtplelelsmx\ndumehssexnwcppac[gucpccbmtrdgoee]zpcpjjuztjtgxxhzroz[iizviarbucshvccj]xlypepsxxhxphttgc\ndeujoayipwnugheu[nnyjneomcvpfrvfu]sfspbwylbnzbyqh[innsmlncnbxrbfuhu]tldwbficslnxpkzlrtw[kyfmnucfyrwlvbb]wedvxsifdxaysaw\nlcvkjzckpkeyzyjgtwy[osncmhyofupofwscd]rysnhkmiqoqulyu[lqwjsxrgpkpkgxnvhf]ftmywmwfpckoadd\npixbxvhtlxjxzpm[nvmqocftgaxxgejke]npibmenishbqrxtavc[jzceumsoxcyqbfv]qcdqqbwcueyyqptc[egixgueerjonkmigr]teecwbxvwhgavdfjxi\nvhtgslxovrpmlojcyiu[pngyxboltgfaskge]eawigmpxrezdxtau[osjcsdhppmqtqxixkg]gkxhhsphrnkjyxgmp[khnpkxghpkaxnvgxqe]zpedrsevlishcdbd\nixnbejxsfmcjmqh[pagzggnbjxxwktstf]hcjdsogfetpzoucuxg[gsnpjjdmrqzojcozi]csxsgebagjjgxqjx\nmekdjtrwhgafduvnmwn[aaphpbnxrwwkhzxn]jqzcqvefysuegreqcw\nwbpogjbyzelmxqeaazu[djdqdlmpfmezzehvjl]qdquppvgjweftqvph[equcifktaceuqwoakk]uxemheczqpboerwq\nobjhlxsujoqunmhip[bxpjvcdqedgvqrv]rvycwulyrrllbrxlbty\nckxcgnosnlskecyq[lcbisjdelotgldlea]edcebpmpxvvgktuxq[pewmfvnkiiulfehy]electgrfvkbxiic[emqhtmrsqfbebmykzv]jfdpefifxcptpfzvovc\nleyueicungygchlce[fbclcyopnajqvxey]jcwvhehawbpflgddtn[xlozeiujqbiinjlvrt]ljmnnzlebbjbccao\nmblrhofhihdiotvy[nfatavuoewnlsvc]gtuqdhyxielngaci\neyzlvgyolwwobcg[vaeslqvdrjthzho]zdakaychskakuufan\nukqgdhxdohzgrdfc[vfxeqopkydlzdehao]cormknsmtbidhgml[ceialgwruscjsapfc]erjsjeuxzxjokxct\nszronkojjdgnfzkpqzq[xpzmblnarrtycgglkw]cixtddybdschdshenjl[gflkqtgzlxeesrfvx]erpfhhlwbsdasjljnqh\ncrndgetyvbvxhujqtu[svhcpjoxbaacvpqf]ohhkqbbwhtbcatwopz[nzfqzdbjhixrtpw]dpyfzrpxayfoglzji[aynmktzgxtegbucrw]igvfejgptghxddj\nefswwtohurobgbpvlhr[sbgfgmsrjsrjblwr]xkswzbsgmboecxc[odmohossczkqjwtrdi]gvdjrovgilpgrdgt\nqihgnzozzcedhgivz[wfzerbwlgrjbwolsz]ehnxlqolcgghtdfkeus[isyrflbjdelvbgz]eblyrmmkbobefzo[baowrnzmyctfmoylu]bzhtmcwxpcqhubyws\ntjgkgtykbfdogfa[tixjoqenpxjbetz]oybvzsgugsucpvid[qukesagikwrrpuesq]xodwkyngdrxadgqz[sigwgfluzksbqqpvueq]rlgcptipyfrgihzn\ntbilszajwwosrhs[rewcahkzssatddmv]wtusvesduewjvissr[efusbpnhwnrdjwgjthd]dunuqtpzocqwyqbysak\nspvqcisucqxihmincf[csjfurernawvtia]vzarehconlkvnhbpsaa[mttsrsqoluowbizxrbk]pewqfgipuxqzsfj[qznswrhnuvmmqtbq]mbjqscwfpmkejjowy\neqeycwhpzzryclb[mvthqzizihyfvtdgon]maeannxtfakrfmg[xlxbqdqlglfspvyqrx]chjokbtqngjjsidqdyf[nnmqygvepumttyp]zipyquwulqtblevg\netutgnamoiukjadrf[phwftwicxcpgdegzkr]lafqcmydwbvsxlegc\nkbwfmffiylhmwisrb[wvoulhoyvagzmgxmp]heupruovkypjtzkilqm\nhjgmjhzizaeqewp[fepsjuqdjujbjpnooe]rnovsbmzwqtukgy\nrlxvqkugtcovejm[vqlkivalxqfohnwz]afmwxjnymstqmem[ynyidmrgyujdkmjq]cliodisdvotckoatva[ysfxjtwokboitvhi]xfxomfghbnfnkobval\noxsmqxhljzdjqtx[eavkvuusdpcbrlwmr]kkpbxnnmuqigfvbrf[qrfzadqfcladouu]irmuceccvwsazcydh[kvkeafmibmbgpjoc]kgmkohjtzjqnfwxkv\nhvvzujphepxjyypzp[isabpxdneywzpzr]rjbcrfhnidqlywbgvxf\nezfeilvlhanyhfvd[wgbqirhrycdzzbu]wpwvyghpwpfykgdt[drvcvbpndcvrcirig]qzcdvhfcxqdxubat\nhjkktoruvvqmuauitf[dmygsosigufbzkm]rjbwsccifhzyhqk\nzazrvwupbrzlepfcc[nzlsrlgeovdbndxwqv]yhjwjlnravqgraen\nfqjubgphparanlll[avwevtaigfdxgjet]mgftlttzuhaqlvwqn[cnxupkaxahrlnjelty]yqgaieunjkxlhrha[xexqcuvkacjayozydc]blhjzcfcoyiozuajqxw\nnacvyqozsyqgnvkvw[urqhhtybjqfpqqcrex]pxfufqzfghzxinnnlq[vbxhmpntjgivfgzgmq]vgsmxbkpphhjvzqdirx[mrnmmtbamdhoved]zziaxsjdqjfvqzq\nhdrdsknkwrtejdgeqg[wbvycsdyecvuclhi]owhsjsujsqjachyh\njwfxtraepnpxwmziud[qhwoewcswwusdqcvfh]czaiemhwpbkflzqi[yntelahhkwcytedvpe]kpkuxgqygwicxoh[vuifmbkhbycxqiv]cfyzggvhpveafhduk\nngiytctkauehibctccr[coszigxgcttxzoqrhvn]hfrpsylypetiwrggzg[xwnfgwaxrjabzmsqquj]gxdqtprloqdojdthh\nrhhicddiuxdobco[ihkmummwydkeoqp]seubufqphohblrkn\nsgslfpeleveakroo[kgpoljsrrcfwlwyzb]zeacrfqqaortgdv[yoipuknesgpwoscvguw]ubrzxeqpijxuflgsgpt[allsdtgmdlnupofjb]brnjhlzxmijpicty\nvbcaptabloujxkqwnsc[iujlwsczjefkoewao]yqwmtuetinhedenovhm\nfcswktnxobrvovrjg[qsaxxwxgrenkdcpfvx]bmivhngglvcwxwgjz\nnhmxhadaretplflb[eaaitxsycuqarue]zzdsqhjjnebzptm[znupjbepvjzujwj]djueiauiobywmclemio\nlzgmurmbxidxqofgvy[nhpkiprmeusixtqhfid]zlpmcgmvjfsqhddfzu\naziympesgvakqhltci[qdofqedxvlvpyqat]txvwrspujxyuqsn\nezewtaywtinlcbrn[idtmhvforhdxgcdy]ohpcvnchsamehoewc\nayzzozmdklbhitpd[xwlznwdbvtciozoykoy]ainwvvxkreuvsgdatbm\nkvacickhqbjjwkk[fryxetyntagtppzorb]gkqgbqhjykyewipbcj[zdaanxpihogooeeqby]lxdkkpostipynvh\nnzngguddxyeihkkyt[wamdyvzgrnofprps]znzgitnmvvvrrzsb\nvnbogcvphumewlx[cboxtlpwdmfbtfegkai]zlxznqxwahbghxz\nstwxjgiqglghaaot[gdxpnepcgstafgt]psljddrwgewawdc[snbjvfbagexsbpyh]wqqhsxerdjilgln[jyqcqbxxikzmrguo]sophymnkilydvivcdk\nkihnifnjfzhvlinqrqi[bcgxtjpdyxtgejzrdi]avzbrcqlbmaadrrvazb[ntmnrjhiklfwujlg]pifpvzbirqokamrmd[rbanfbdlrtmtkxca]udilckezqvrehkz\nliradbqjmqeaifibll[yrfnryjrscfrxgazpzc]vxmlibidbmcwgoygn[ojkunzztsdudqhma]dvmtamzfaanvyivxqrq[yqypfcmwnezorcnbzy]wytsaklpzfftqat\nfhaxbfjherqxbzbrtg[nabthakgwjarjsfhj]iokwyfrrjtwulhwi\nasundudwctdvninxpag[opdvadcnjnbxptahj]scynlgwnmzdtmudu[bupcfcyqmmcwsqfffb]rjargbcgxvonfgjco\nzwzcwjnudozdektxh[wesqhjkthgohlufhrf]mwqrvudkqiysxokugz[lcjiemidwqbdnohpd]psvhnbkuptpjicdmb[vfoerfpkymcjmhzicwm]pwykcpzewskfmho\nzbhxhhqfeurqurm[buuctguwokorlkfq]extdceaqdkokhdaxzqj\nqcrnmtdrftlnyciul[qvtjesglscjradq]tcoobnfosubnnrps[qafsnrpijrnjkemz]urgzkcxptagwndzug[olhgasghsicjvswx]higdtidzwjfzlfkmxbf\nymvlttwormrtliwoy[wrcafamahrcipugxxgy]mjzzpdkuowbrbqtmr\nswwktdvpgkbbntq[jujwbyzbmzktmpag]uinhisqwpyszittfqe\nqrlfgtcrpyanzwfeuhl[sstllbrafqeobsocmsc]gmfmnisxdoqqctof\nznfoqfwiwmxdiixycul[tsxegdjmxscgpfllqvi]fhwwrpconfwceqv[gqpboszvyuduzehsun]hmydskzdmmifotkn[jurqmnkixknhmwj]vcjomeocgzfhftqq\nwukfxspnkhedqdbtfti[cjcrwokxqxfqbvfatie]eaohmttcidinhxqtcu\nusgxfhglhuknqauzic[jlhntqhcyjuoywthv]hbskrwccmtzgyby[pijipgraqquvxhso]hehkqohxirecivlxnvo[lawgvpbmozisammvpcx]vuchsyinsehynzm\ndgnciyptfimtrbmfbcd[tedeoxadobgoobffh]iucidwknmfofwia[bbtbzcwjwiphlcruw]ukwczycabezutqdcc\nhuxitbsdoqaffnlyxyn[vzcnvdddtezaeymzrr]bmovgbcqswsdmjacezx[jjdtfpukrwhiafcy]fwlhrymiaolokojdkx[ftqdrarkfhfbelc]yfonqpoegjmmxkwhz\nldedcblvfbdacsy[rksxibwzdatluua]agxedenvctglzyvpu[qkwulxegyokwljso]akjfktolnkzwsnn[lfhdwjomyhroqkkzk]mtkhpnffxrrwipsrqet\najwscynjeiagnubeew[ftyzkgsmsevmdkpyv]ufeszcwnhqpwsep[rinrtwoninoxbqvlgy]mzacylokxrhxtbyut\nrdlragvdebqlteu[kitphkhhnrssleu]chisqrsnofxmmbegi\nsjzglwvefnntfgofuax[htbkuezcjsfgohzynlp]wquzxtqerwxlperau[kqnbhymijqtvtzxbra]tcwbvbockcilgvn\nbdqyqodloytjtcylu[xgwgnadrhxshcyhd]qshqmfdqpzbruygmmzc\npnwkymgknqqdwzmymmh[vcnetknxxjvihfrlvq]cujdvtwltkpkzwkc[owjyboqcsymigajgish]bdklpwzslsjvadacm[mmimdikciuetfjeece]dxwoxjenzguercr\nvxgoxslogbrjaxbjg[qyyckvarfyidktepi]odfkcgodqdusnjs\nnmumnqunfnuhvtucy[voatnmasscuvwjth]grckxjhdzzoqtpgwm[qwmgudaltzavyrchqy]bmxedeqkwkgoqyrmlx[uqzdpkjekjgfvlnfwh]tpsfewpellmljsakhea\ndvvwqujegsgarow[rkjpzfvtrtlpcdlc]kvpqbvyshmoemkhvq[hzbtnbzhmgaufkfvwh]ipdgirduhpdkhcwzfid[jmxetzvqbkrhkices]yzrxhfcakriippr\nxyijrstjowvehnp[ylbnnbclmipxjtxtbb]dtynyczfzgqozpa[rmontkapaesmlvuasig]qmuqzwqsoipzutdwz\nbdwyvvnsxojfzifhkr[mfdopzhxfakffhoudpz]vqnrhwzqbahbztlynpi\nhymeoolncfmkblqrd[ifbyrijjwxsjvmhql]vgybqqlmoilegcrcp\narqsuxhcivbxfiuf[jfqqzwkamooqvyj]awbpyjrtunzulggzmh[iipnlkhwzzmzcdi]ktvdnpdmzmkrqavxsxy[dnoqbxknjvouymfz]brcemvbpovqjdvps\nsxhcuagminkkyodlma[zkcpbofatowxfdddhv]iydjxsbzyvvptmrivf[thuzxghsyyrkqbjozw]zicredtdvmavltqgeg\nqgvauvsmewyfypvgx[bkzpxdkwztxbpak]ghwmldmcmotjcmun\nivnbdeggumwedodrru[ejwxagdnszmvpyxtsfv]eaabhawecgtctegy\nnylnblglukusyetuly[annmbyywmkzxoxcubb]fwslxffcquyfzezst[exsgjgeufpzlscazuw]rebffdvzignmrpriw[qwsiovjdtaimkun]utobenmeyrtxlorxjx\neivxnczlgqbmybivjx[zrbbxnnjprbaknh]gtfbkkxqoowynpt\nbotxfdjpvcayvpxmf[jysydtitavnzahbeg]zwkgkehpvxtocktco[iodpobnripiqifmexh]zpnrcxntqwwwucz[nwrxbbqtsqmkaiysi]pecfziyavdcfehr\nbmfbcrmibywamwmic[npcluivjtbtwmwxmx]mxyepxnjdabcuiexhwi\nkezzmzrmfsmhwxfhy[euevwjfsullybtlul]edrcskoqqmtwbhhafnl\nyywsnxvznbcockrn[fnmwrszfamgerfhocoa]uxfgnvtphthtmeuyy[houdomoboxleqhrf]zznqyqwslypolnqef[ttbcfuirmlnwevhzw]dmohemntzpwivaab\nxfrmjbgozdwamlqe[rdrfdfobgryckvow]gzbnazpqaqxcjdro\nvdxepylmqqekuqe[hagzuweczkaioxyz]sndgjumcegndnuwwukz[ymkpvinydrrvfare]oplwhupwenqwloy\npaikbyhegnbvcqa[kawvebmxrhzszrncq]noltxgnszsqxfbxbrk\nhwifnlppmjawmyb[gulsfllyemlqkcws]wfopsunpcakhzkz[fcpmxchdgicqido]tlvnxgdsecuxsux\nyogujlygnpdyhkxpdf[bawcwagtpbuwaorpa]noyoqlkcbsytnzywva[zvdbrjsxhozvyrugdnr]yyehxcwcnepivtjntex\nukkuxsacdvwqkgwu[qfhnxatswcchleqaeg]qynrnkuwuynramm\nsrvnvdghsmgtyvvli[gujzqjtjtrdfeandy]rypduscceqqfodndh[bssbtbzcdoiygtdse]klhkfnjidkombeom\nhrxpcidpccertdnde[iubpwxhlmbnofumjnk]tzjinnaqvzhuqmjgzqs[tbpdksrgbhbhscpnns]kgaslrsilgklgukanif\nxhrwvvblyiyyjithaqj[nxzhuqjrftquwsq]juvsrstyudnsyjxqpko\nqjjtuuqdjaovcgs[klwmohvmeyujgvauez]faqyixqvshgpkrgvac[hzjbtsvreecwygo]vluysvnbqjuroaondag[qqaysmxakrfjdrpvj]lteebmjrrlysmwocpg\nfkemhtixlciygti[babpytzqdpoovfy]ptjooannebsdcfrs[ismooacbkqjciwrfw]wsawvmoxxzwzloxunq[wrjhadcbmeslujxk]zckevlidqnpsdordy\nikapdixlczlrtpab[xyfywwygclrvxmc]tugwitpyopgfhucrrp[zjnmpndgvwlqnsfnemv]xeahjahtuyjwjwxfdv\nwjbljlhlkfhhkhrz[kfhvlihkiqprhjno]mhceaicjbnvajugy[rvkrsptmdupaylqsbv]nptyjetdstrwmqjav\nnqcmyiscwhuiafdyg[njnrwedfdsnzkyg]rsxrirfayriqxvyqthn[alkdpteuyfothxvyeow]smfyaybytdibkus\nmsvwpibrptekclckgdd[gdowictxfvmjmdtyimm]nlrlpatlusnrqcydh[zqiivotvmzapjjdzhx]eqxxguxozcbzlfkktk[amsfzydattcuqolcoaw]exjpttscqgketzhe\nuqiaugsvrqenozqcnry[hcmsmwdqjcoohwlu]morsyizcifxpoyzes[tdnfcmzkcxkltvom]jbkvbwcolkcpkxdlhy[joounotcqahwjvx]teeotmpwnuvnrgdxscb\nxsejzfhwsziaedxovv[accbrvbghrsomiv]glmkioydimjfcneh[xejzphhekszjpec]qfetmjhsfagbzjurrr\nqwmyiuonuwttopaz[esdvdnqxftkihzblcc]xxfxmkdxigfxfwadl\ngnvhardsrapmlpmlg[gmliinpyvjenkrnnh]kovjprgbyfdknmnbfme[nhzmroniytmwwfp]falokmiuiibxhheszok\nzcczeqrlhunbfsxu[ifzbbveczjlfwppp]pvtsdxzdoxrrlukmqmh\nrbgkskquxcvswaf[xihgvfvaxkptizohvn]tbntgfbhclvkdael[zuxdeparbafjpwqvg]cpfuexhjmkrdurlbnis[vfmoasavisksmltggm]hsnrpmdkogfxnprmvxu\nabttallvhutezhtr[beucmccowruviwqjxlo]slskvryjaodaowc[vqtmaqykahuvoqc]valnulizvgiciruetx[rbhcdafdupnswhn]bppfeuexkximknecfq\nhlnjhkjucpmxmguhb[gtoyutdhjwfudqnra]pipjkprnypqtglf[phovsbawbyxsuwsyopo]phkewndekgucmrrbw\nbikqggafubkrtyskep[eugvetcxkbfuajpuz]drgqdldmenwxyldlwd[klwzyogvokknfwdqw]ffojmxeeurqxasxgf[qdjndihaiuwjqie]uaatdignzrdeyjddxzg\nddjhxhnkcrmnaztvps[crzhufiibsjerulkslh]snirbjgmmerlrucjlv\nckxphmsmljtplee[mbrperwqumwnitb]aikxmbbxmgsmsfgeni\nzwmouppnlfbatcigqkh[kahnxdhbhongbfgmtxy]kfictxvtzrwlzvxees\ngfrgqbgweickiocqas[urgmzzgkrwpkfhpf]aazsfnctfvvdrrf\nsgndtkclbxdovlte[ylbolooanippjrmyi]lfydwbjkfsgdrecxzn\ngfypysbhqsgyoxrtxxp[vdfjphnhrphzphdia]ekhgpckheqjkjinexuu\ntagvhpldzimodoca[odnlmmdinuwyazwif]hsresddnysmuldvv[zpnjyvabzrktghfvtfx]jbzsfhvzaglqkstj[leniqywipplvkues]zumzesiphmejqufbn\nqhkrsmlwyoxfawk[egspgdlxbrdcwvoeje]pxuytqzjiabwebbmu\nwsxvnbuosiwcutjct[nzthycbqcazrnqppb]keasqheprjcqwac\njyiifehztqkdshfuj[cddnloevonuheydyle]tftddpechuzfagnww\nzyicuknwqxtzzzy[mqgzslkciigsugirbcu]vadteaxyvnpyhwbec[waifsdqtrcbdnvrl]dygogwgquwnouhc\njltdbxzvwoxlherhs[vuuwuslxdkthbcs]ujzniwntplzaaldguqb[zdcnhufvintzrxm]cunexbzfbuzomrv\nhuikyoqqhcabtgosej[tqbxkfxeqyclgcqqsu]thtunfddczjfocqmr[vddedigjifexfqgp]otvsknxemvtrpbxw\nsgukpjkupqmgtmj[qmvzpbebkypfmje]howlgwptfegdnqp\nwnomkfqdtyobjkmd[goockdzswfoumhiavf]noshgjhgufjxgxiro\nivzlyzlnqpslrbldxqw[qmlmhingxmcporfx]bccugkqyzoqaqbv[msgojkckxyuihysrhp]hdmzempetgwwycoy\nxzyacqjyialgkmmcj[aqenwwtnrupdsmitna]bhbicwoaervlixo[cggrwmpqsyxfoidjm]yawyxhdkscodboohvvo\naoywrlzjkqkzcmmicvi[lhwojrkhqdearhac]zwhrxrrrmfpkjvrnd[zwdpqkomjgjvkcndhi]cxpctyvgnthrsarfhx[clnierazieohvgsy]eydbsvaautujuqqsr\nzfozpdjsfxmbwyb[ignvlhfnrdhybkwhxq]qfxolqnfiyokzcbdy[ohvvpuipajnqwml]rybjvumgzqgzfveqjvy\ngkvxesvhovzoekxbmgh[hjnizppxqxtlkdj]mqvvrcdepnalllarg[urffyistzzqlhimfhi]yhndztrezwcapskbkz\nqbuqvobipnbazji[qypkenwigkvsjhfdhd]pafhisczyaozydialh\ndkocroswvahrephwueh[qtiawejyhzlhsnlaxz]yyelniorfgcpgfxtle\nuyuylzyqivmpinpi[nxooflqcmtftzosn]vwxiscnnmmujalwegzl\newyjffqwxipurwkejav[yxcfacgyuuqpjqxgn]bsxufukndbljizkbo\nlglancnskvgdozzuuy[eossyfcrfjnpqtim]mvjbtylaisjdcgyn\nlxrbvlmepaibubsqlc[pnndwclekhualwxbpg]cxaynaselbcbisw[evtpqzovucquqbgg]lsscjpanobjuqlpkhtu\nwqcqpnmdhfupmmaa[qawfetitfsotgsibhg]vanugoxziwlnbda[apowiuucwbqxkcxry]kithnvgmjbuevopx[okzohlobuxbbjxeul]wrcnqenrhpvmxzp\nqwmlncrpjifxmtyxjil[evgtbhnhavfwyih]ganxbqprffolbtg[pxidrhwgdqsycynecqe]sukgwvxkhbzolomvx\nvmgykxaeppaasupwolg[pqkilujgqcoxpzys]vtmypzwtqecvidu[nolweceicrhwtvov]uevlxruhysbiedfibc[ytdalspbuzpagzjr]yrkwrgdaptnoxcqqr\nfgwnpezirnabdiwcknh[qnwczufxpwtomgr]umwdzmivstlmecryoh[ogyfrrqklslzcqoo]yohswnizpisqpvpyu[bmwnspsfofxvrvqkc]itdkhtuqsybuiom\nynbnpjgaoammxaoagp[xkivkmwwiejjbbgk]ongbnbtqtcxqipe\ngxuxnshdgyttcjzvk[lsxpwpvsoquxuazidye]mfihmxgxumzfhnm\nngwlkbdsfkoopeugbf[zkcrhoyehnzszjl]jwkxolilixmiake[kcoazkmvlmmlxhlip]urmeqvldopqdrvrdd\nhnlkmhqgkitizzp[dgtnogdyumxjgnh]gazsmgjzighgwpided[vaxfshfsqkmebtkceye]ndxcvfbzddvksncrr[clhmftvehwzwljbp]tooichznleiqlksnv\njgnvwreomaddorfbnna[oedwzjkpxolayry]wdkdtjlmdviveeog[tkbjzabxaqxvbnasst]lqttnyqfnirsajb\nyiuwebgrrtctqhvq[dmddhqpukxspoiaua]egktbjgjcfzhltkjtyu\nsbfvjniiethddwbjx[guajrdwgcphepysv]qntvmggllbcquzfu[qtlrmikwlmlzfpqufgk]tjwivdcycoacfcwwfyl\nmxbvlmxjhiorcnni[ubvkvylqtxbchszgp]kzxkzbjtogzujapfq\naezkzdgfurigqcdxt[kkjkjuyowyhylcxzs]maogxmmqteaectjv[aocufmtewquabwa]wlidntwbxueqzbql\ngngwphszdvmcnjj[qvbontopydlzjywvaiq]jbrgkevvbwzvkcpz\nqtdsnkqlmcwenkzxodb[wqmskmdllfarzicsce]dmubpplnmipygwqjim[yejatlbffcwmlyrek]gsvwxfaeblczgpdvhhm\nktshrikjzljpacyux[omqqrcsqtbtdqsupfvm]bggungenwwenmztg[kacviemyqpqmwmiivp]petgeydeoygoknl\nlvvozapyfvdohboxrt[sqedcfculzdrbsafvg]ioohxzwwppkserbkim[bytwtckhnlhtxgmes]uzwrmuczkofyfgv\nocskfzkwwmnkize[wnjrhvmcynlydnbvn]qbykllzinrgwfvod\neqnrivojtcjljsfcj[rlxxybjowtdptsg]rnnvkyrsxzytscf[mbykscjmwlryaiictd]gmfcxwtjljrpihljll[gxrwqhtelbnpguyvw]lpbbvcxyokowlqfih\nsujejaymvqavyvhwpe[vzobezygmsxvqwnnu]dmuyhdixfuqfbnehqve[gwdapthzmbpwtui]hxhsorcfmtmrdqqrzf[dqrxkbkttpsjkqpbnl]qsmueuwxsrnejednm\nvmqbwehpqesssnps[jkyzwrfofkfqkse]glwxlfrqaamjejrievu[jhbggigitejevdzgqsm]sqxbxgyvfpqtxrlbca\nmlbhjbelhzgprdshat[zcytqxmfhuyriabyr]yzhvmpjfzkhgxavltdz\nctdohoakygysybf[loxbfdhctlnhggxpoq]bimosyslpbihbwqp[fahhvvdfkiiucdf]bbgugrcsmoasoxyymgz[wjhbkirawxanrqf]palckvdfnlhficazmwm\nqoetptacgfcrdrstl[gpcfptpchpeiicbmfd]vsjqqgbwiqlndgmop\ndmlzhkeleeqkgqvriu[qxzssbjfthbzhdf]inuernrmyomwyre\npcezyuyfhpyebmvanp[jccebfvhvicqksgwyqy]nssvudrlhkckath\nmrpkkivxuuozfbxejfm[bkwbwzhwwkfqqlupltj]ngrlyucvbmdilkke[qlzntmxfkeapmlbumu]ynjqdpmonwypyjpalvh\ntkqhdmjsbnhbvkdgo[jufmjoypjidudkbcvy]olrsjedkqdbeijypjp\nbrnhsqltbrizrohj[dlzumegwwcbonaa]llqtbxfulkgjeqw\nvxjgwcccalsesmngkbk[owvdclfjsyhgchpt]zgqonnjsnsqxxvqzmqs[wsmtnxjpvzcdpobat]rkgwlaecswhucndgv\nwkjmaneymsjdyjd[uvgaxovnqgsvamsbz]naumvynxlnbgksk[mmjeguwrwppdwmdjlm]puiytitjsyskwomrfqj\nfquaiztteofhvsbcba[hvstcffflwbvchn]ntvqaedorhoikidi[cpypurqddikmaynmxzx]qkrvwfsppcglqejkn\ncpjplvpmbumvgsduald[sowmjselnjpjwhav]flufpydujtzuzusyrr\njfhplkijkstxymvwgz[kbsytlilpsegzanvlee]ywcxnydvgcxzuibxvu[ayieqmzukhoxmcli]rsyubeqkgvobehe\nocsbswhjtvywugym[twhemgyfgdfegogpj]xamojomgxvyedia[rukhjizwdryazdtdsb]fdiecwglfmtfjqxocw\nvywxxiyjfwsjhvjmk[mwjsyhoifeimjqtmx]ribwktjvuvxakqqznf[izcdtybzxfbyubfbckt]aocntguubagirsgvz\nursnbtivqkjfkcbls[ckjjoszuogsdnficmhy]wwzjkspwdvilshnzg[gzuoexgingreqktak]ywmfxtqooxdgqaa[bmucdllxdktiifoqp]pvxrfcknwxdjivyym\nebtozyepluaazxsuoi[mocwxdgmeyxmoulo]grazonsbnsnczptl[rusiwrrcbqpybtjfxt]ewazwwjculbvwjgc[jmoyjpbznvzlvnzu]ghwsmgrsqjgragu\ncmbehdhyvukkufctwpl[toklbggcxvjerfqozbj]wqbacnegquxmszdul[ggzaznwywpswuxmlmg]swowxuqlmlfvxmznm\nqbebmodvutfozxt[macysosjlpjhykkb]qdewwbokbiqofejcsj[ddzpouyuxgogajwmuk]iukkhkmjmrrkefycw\nadaobhuodvmkfzrbk[ucroxtaavsmpvfd]nvrnzhxozidrgvf\nyytzgmmuqrfqegalpow[eyefbjmsyximixd]sgxjxpfncigzmft[zuwduxnhjiidywvsm]qmdvambkreelttqmv[mqhlvabyxnmnjfpkigl]vuxmnunvxclyhkxi\nqdgaknszcwxvyhlrfsr[kbbxnitytjopwtruar]ucanrksrycnoqlcvrd\nnqwjdcnwfxkdglllft[gbawkxvzhyiprfenf]ysybkzwywpqwerm[cwsthmeytiuialllzxx]plcctxffnigyhdfmndc[kyyvjcfkxfofxfsrw]cwynasabqneione\nkqthcqbvfsncuenmqx[rpokleyrpkohzefrw]txvckiapuezhimt[rrfglfzarznwgchlej]vpnrufinbaqrbjtu[hypcxgeuiotonfxvuf]cfpjwonfyqddtogr\naaxuojwascuilsqjt[aqpfsummtaolqpdi]qoqnuhfpinypgxiex[peasbtrzdkneuriyt]dbhohenosanaxkqqxq[fwvbczhithdxtbdpd]bmncqvxnaijxuexu\nmgiepbqfrprbaqd[swsyfijoncrtrigly]bzdkfgrsmwamezhp[minqrxxklutrtrfxps]dacjpwxdrbxhumh\nshdjdexuhgauroqwtmd[jpvifgjpgzmjlrnuyj]svvjpufybafcjsoppia[albycpxsvxdykattdos]ewhcfugwuovgnepvovv\nldwjwyzaqxwfrelh[rzkhymugnnpmowx]xufycgvikehdxxggp[mykgpsmatnpimovscqe]cpdwiemofukofnauyh[iicxbleijoxlvml]dxzlvafklkbfhqke\ncqdtbwoinxghfrwulij[wwuuffpfxzcckuf]zeayaofaskxfueiq\nodegrvwiwncavmxd[smgtzidklnmlnltytx]psknhjsrxwqdqlw[kmejoinwatytdkz]dfziwicdcmfwawwf\njzioqoutlwitjdcb[furuyivyebozkvcny]gfhakdfpfouliybsvk[vfrykghujsittpcxjnj]vjekmvdvwkaffrhhr\nrclnyybawbizurp[cptbsqptpvcuchcyncy]rlqjeblagqogxwy[mwexxfjhkiyoihog]slgmmhvjhpomcvgabu[xgipgcmbydzmayywci]tptdbfqkemdnuzvuz\njunsrcleteqbngabdh[loajbjvuielphzeel]yquxjlecdumepsr[lktbtwjmyeqrurys]ralurzrcthwtkenjtet\nzgykbezaearyhzuxhta[pqtjhajbyttwqzfozi]dzodljvnchwsytat[wrdvidyboznzzbgvxc]fnpmjaiocpucgucwh[kiqymnngzdrlcncpw]xkjzheobflinqcxu\nkbaghyebhrmquslcfc[ukdaffinqagmwhvhl]ruyaqrvavvfrzwiyit[jdhkzojqtxymxoaval]qfxsbqwjtsudcet\nobscoqxaeartfjmeue[dtceaealpasuxsdoo]zhtpbqqfonksrcpu\nbphcztpaoqfofau[wlhtxjzhyooevsax]pvktnvejsbjwsizugxj[aijfjqhoxneawmq]dlfbjynbvobrkyur[swgyiujwbafngtiql]nepaaduwebbpsrew\nfsjxwoamqjhjvyyr[johjhabbsofojaxccga]tqcnhtvkimixbyiqt\nlrasfxkclqtptlt[bmwhuwhzvfmwxxwla]xghbszjpdbdykjmfvhx[cerzilbrtilvfptwid]nkzdvndlbgkwkgzwatw[njpjupthwiwffesnct]cipyoqwmxtiugbyfmk\ntxfqpycfderhwnqtrp[cvtdbizqhlxikkw]nuxymppbyfdpayjxt[sfsnmgqrjqrlfxh]dgwdxoveamltzalgyw\nntfdficysbefpup[fvdhtaqmjosqoxosu]pwrbdoceiweqrfyrx[ftlwubetphczbxhx]jolpetpuszxjkxuupke[mbcbzrxeoqpibuyjsgg]cpdzzdzkwbucybc\npwwzjoakzydrvkyn[xisfgbgguunevtbg]ntzbwgeohmdvitrtdpj[fzkkujhplarmvzckn]whvdpxzietgdyfhok[hlmsjxrxxrdjfrzncyi]xvvkjroullhawqdj\npgazkqglbbjzrofkpy[mkeiyuwlxlmgmeugcbb]oguzgbkaasscxhict[lckibbhqnkatvzlqcw]ulilgiydzfsdwngr[qcrozfdctltxaatyajh]ojyzengehkhylgh\nzdatmhxwkinjiumoy[qwhfmokowsvzgcngeax]uqebryzrbawakjz[ltilidihghatuhi]lljxtazlhxbrnvwsrc[updgoblisisvpdqngzo]tjvlrlfopjdoyoisim\ntfguxgdgurymskwxk[ngtycndepeqrcif]gttrbjkhsbrfczdwxo[xulqdcmgztpjgiajnkn]pgwsbrzakmvblfsvlsd\nlclevdvivjogclcmn[kpxlegarknivgdvfymk]kygexxjbzqppiywvxtz\nzadpyjsswjcfimejbc[htbpkbzsmbkfeqww]ydwbivnpofvmzvw[archeurcpsapgylrf]teidjxdxdailsbb[nmoqxuhzymlxxqykol]zbesrnrszqdpsbchg\nykwptdjfydxfdue[svxdapsdzsvmsifz]omdvdqwkswiktcwkma[tprmxhwqpdycftzlsz]dyfcmpaaokppkzvoa\nadfqjdussbzlxfvlg[hxktcqjmyqctyjnl]ouyrbuvumwwygdc\nrrryoldbjkwnauaz[uarnttzxeuurzokpa]clkjazjocprwqti[krkcdnwldqexavrpo]fdegufvailefzfi[izadiszyerlbhwd]myayzynvrymyobbfdc\nkrttvoiaszqvnme[hlywolnuxbxjhzmnt]lwcvxyuuugaqribebi\nyrznsouskotcing[jnttzbfwdrpszrcqr]dhxidpojntnwrrsjjc[dlvjkiqqyrrougz]bjhjvlhvrefihomycx[veomjtdhecgcvsshcwo]iboybnggfhdhymyukl\nqtvgzpyhogqojzi[vtbmgswqkcpdzhxwzo]jsmnjadclhgsofgrq[lltxvswaeqdbvbyqj]gvrdvrgygzhbetbkjq\noqmbdnnrpqmjasc[hzdfeapdznngjzjchow]fdoxpevjbqngxrhhlhj\nujszwtyancoxbcga[qzpevsjkmozdbeqf]bdzegnfxtazxdna[wyinvjijbvudlvkwvg]mrgzfijgyouxyio[qehebkkwomsmozoojy]sqhbhyonrnjocbjzfl\nhinhkyqfttbnnou[luuiucbkkrnwiuqbwb]ujfitmunviqwhkiziy[wqbetolmyaceofd]wbwbxudxttgmtuxjeo\nschrxkylmxpwphllds[iijplekwtutqrdkmsrt]hvejiqeylhoxdpkxz[gbhczsfvoidbktsgbqu]rtfwgjnvhjhemkkvbm[lxojvsbvcnlbuofvwg]ruakyrabueflgsnict\nfvqtupyapfmstztmbe[zxtzrmjxlmgshjlfywb]tdihozcziyvstvdtvd[ifzqxsyyhgstjwlr]xihkbuvismdtqtfm[xtxunrrzvtuhjlzoji]zotmlgbjircyvzgcxkd\nshkjoyjuiufvxbluji[saofjqdwpwodltmra]xldohzmyameybbnw[zwaispolnanumhtz]hpobrxhytzqmkrkf\njgaozdtecqmpueg[bnfjhfyhdndzlkxrcb]esbfjomhfrfvzgm[wqvhdvpvrbsazqzgnw]lkmrymdcupndnoktuv\nmehlgjudopvrolla[ghqzncojnxbdtupn]vacvkbpzsztmzhz[tcvqbgfvrehiycr]unpokrfctcwqexbgo[hbigocuneutkffaka]dwwclmxsripmvcluve\nrkdurapdxvohktm[idaisubzmlljyfbblho]kkkxhnkaiaxxyivjsna\nujdjbvlqoavnuoeeilr[tpiehldutfyewbqv]crvmofwdjdesxrl\nptyvtwbbmoujjbvsf[avhpwnutnjkysjdubd]ysgpwvxugjswjzhw[fvgohaphbuqpbwzr]sqvpubqxxhmfxvlw\nsslbaaxswqcqfln[nmdfjxyyrexvtxv]wavnexwpbgnrbrwyrf[deouszhzjkbxxrhvkn]xtfqfjexnqgdiddxh[tphqtpimimjxxkkndng]ncngkkzdnhmbqohupgr\nkcowklgmyivdmreahg[nhhhjuxwoafzwur]jokzmfbbnzsobiahlhi[qgzkumabuuxqhki]ubnjasaqscrxdjy\nccofivnvzaxcise[erfolydklxltrildvth]sjprbxbfldbsozha[lrbdfwialwqinprra]wqresduonlpwaamhj[nmlgvtrcuqvsirfhwi]qjtgpekylrqmxxbm\nfugomjlqyofxoij[prndifttmowgenapio]jpvcsgonnqmvqrxwo[yuioijkmnwkyiba]gtosuvsrcszwsotg[zvtndiccjofwagevdcb]qpdjgtopkcimpfyqw\nzbzstwtngoozwdgtkme[mrcfdmgpywwvikyrto]ktlmqekphuekemo[wenupyuqahrgisu]wjyyqsuatrkzlohmo[judqmuzbdrqamof]qiovruvlcreoircteb\nyyclnzxvjfymqgrzup[koyfzianzwtvdjga]jtfmxjxehvwejfl[xbebzfwcbmjrhka]oqnpqgevsokznwo[briagugdtzfswfbq]dmnccxrswiebtkwao\nmuxweanabaymbamknkz[abtqprtejlmchtpy]nmrtnrjxewbqynvbe[rtxnzbwcjbtmvob]segkftbvlvczkgubgp\nhkihivjdrqvywhwt[xpciwwigazxeddp]vkaysmwlighihfka[lcyiuojfjmmhltubrj]spandymlggnmqiact[xizoxzguscxtsut]cmjecsmmjasgpvx\nkasrdhbhmrlwiczlyp[sfvdefhihrtmmgele]voszgwzdjlvkejvrkn[ahwvipvknuyzrzbrmkk]yuhtxgfpaipuupqep[hezjazdypaguhxkwud]bsfgurgwdetewwg\nmkxpacxlrpbfqio[axwgpntpusujnovkpxp]afzkmjvcysdkbfeli\nmspmqxwmjhzxqmbhbj[zniufuwcidklzfpuoxs]uvlrvuhbhjhudvx\nnrgtmsqbjxlnpsc[hpbskrvswufaucjmjv]pkuulesksyygynxyku\nkmopgjfjwvvrfgvo[qsigvjyusqjqziiuwxf]ewkbjkiqfgdwhkot[tbrynegplyfllxcqaar]cybelgkyrndjodpf\nwjzkfwmrsnyjitglauy[jnncpybddtktmehxz]hluaspiawjwywug[ujwjjttoevainaxqmer]gewchllvjclaahplb[haewxwlxjjnfggtg]uxmnawcpzfwhfiefo\njogfshkvmshdacro[anluswkewepuhbemk]rwfxbxtmtfgxatwj[lwqompcrkgqzkajgrqg]ckjftivpzkflgbifzx[autylalyokqqlxgu]chewqmwkwewmwoby\nvhqxmrwadjsfoprv[imclvgvrtvqfbcllpr]kmgvgofdlkarrusoo\nkwkqhpdsrkdlhuq[njldfvflplvygnihg]hikxtejykexrghupbqz[tanglgtyodyncabh]ennzrvfvgcnlehci\nhmibwhrmzhcxvzgt[vrdwkryugziqxxfv]tcgmqhirboxwvyy[mjgojhlpjolsjtcu]tphrqucjxjpsdsi[ahqidqxdgeucevqinms]edzoyewnqweqkla\ndeizsskvkzcsohdf[plhmdlimpiduxfdyzv]iaodhxioxasudzv\naepgcwcwlpdqric[xyxiplpunvajsjk]dkragqziaqxgbwr\nkeocoxwzsscocdxcf[lvdnlggndlqzvxjo]cajmnvjxphmfopy[bxfnemakuysdjvhzv]ymuttirruskkndjlpw\nrrfoglacqhfucnjkhsf[ejgwoteprdneomyqphi]gtsffeskyegnxzfkssz\nawgoetenjdtwnpw[hflbiyqshareqvcc]qxwgczjnzceffwk[eumisjskpmnqfmox]dtsifzhnbdvlfaqdkwe\njezzkwqvkbbcskih[cxqpssjfttcropqrk]eqkohazzfagyqpjt[qveehpentvwwdazsmdc]enufhtsnszihemkf\nzqokauntjcoqolc[kfjplmodgrkaeuuvq]fqicoryxfrkubee[fcncbrofqpyxdnejn]yebngpgxcbjnivisgza[bpwzrwupgpmtbhg]ufxyezblslkscovzaqd\nvdrhbvkjchpslgpwwdt[cfslokjhwrpogwmf]qkxlvkrswbbbhudgk[ryazzfichahhigijhc]xbxrwruzjhyjlwxf[xlulxjmhxnhmkflqw]xtkuftnstlwxwiirwko\nqwbqncrimtxfjspgyyn[ysolszsumngdzijn]stfhvhqwymtjpauip[lnucccqwwzenxlytrb]aumcvdswfuucagbkel[skoaaxgeqadxehwvjt]jrjzozvfrrjrsvmov\nakweexwajqyahlpq[pjxilukjsvzjerrcdcb]qsptnuxrshmerfccxhb\nxbnsmtgyhitmtounl[msqlrxysydxdydbtyho]varxjhsmmqlilsprkq\nudmbexywtscnesd[azofuoboewwundyif]mykxybobvefathvqkfx\ngjedwdykwqbxqpsb[nykqvlfsckqcgfhvbd]xdactphykfhbpjollax\ntinuplnorykjcuete[qqwstzqrupgcliapi]durprlvdyucmbkhceq\nzrfmusbfbogbrsin[gaayijtuqfbfnxb]cgjsibujnswdmuhfez[rhatyymizrxrqud]wpvajerbhxbtrva\ntpjpjlmhvuorwnd[vnwdgopuigazzwytzbe]uaplhgdvedfaiboz[rqkafxfjjzjwbzwung]cqwjlakbfpqvxspia[chyrracxefgkuznb]chigmcxzjqnzsdn\nbadqhtkxeokdbres[wmdthitngyoujdumxfb]lnafdeqakaggcdttnq[acuhhjaemkakovqq]vfvloofttmvvolbpgb\nmyaunxirrlgywdtyrlp[nxinrircujeyezto]tdzynxmmbhjybgz[sxbjlwhbkhpplbveqk]oplketzgeeoczpadvhj\nwtqjkfmtshufwfiux[njjvqujaetzgcihtxvi]fapfzhffwqovrvfpatr[hwjfoqsbiothjtrbg]sfwifkjkimjnyzaui\nmilzoncxkgtbsgtxgb[zvskfgfsgefelbjckwy]lrdralfxvtlupde[kvvibrstieyneglniu]pfyopkpteyovtkahwby\nsjwqwumquvxpwokonnd[wooozqoxtlhwsfhtcic]tgzecomscwuxgazattf[dmaxzgxonbkehxgymq]xbqkxgbziuumwex[csesnsjiexhypqrxjj]dbscxozezqgzexrwci\nyqgpqvteubzxsmjb[bntiezjqbiywrsq]nrgpewzpshvjwdx[qifsblzcgkiqfmele]oypyewwjmytlaujp\nbxlsaiblatkrxpcr[xxnilxrehixaglra]apwnnbwgatzwgmr\nrqsogjhjijafydmr[krhzamyodyfpbdv]jkjdjxgdszznhiv[ywihxdwlgdadayqm]cjvrvelwbegtiqswzqr[toujknandbegjga]wvdikqjnnxpuxtijios\ndqlbbhlsllmcdejnme[fchpcehhwkjwkythfc]shnipixrreczdblufyb\npljkshxmvbpvswl[gbuflmmaywvbjwibfud]mexysgjrvoxovxtvici[svuosbkwxjzhvmztiq]cvfjfnisqtyomho[jvrshoymwbzcpgxtxl]ysdystgkeioszdbora\nooyljflrcdoujmfajfu[qvnbylveipljcmgrvl]cjfvbounfvjfpsxmbnj[mohdhwcdrykexihcgvb]gfzxjkkqdnspzbqb[jkoiqbqtbjxgezxvsgn]juvveztzrtcxhyp\nebfbaesgsxjbwhkmpxp[dzkhyyykwhayaztjt]xkxdjdlfvlzpqbb[tjdqvwygsgoldpffs]uwccbahfnjkhbfzcocf\nuayfnudukxaldfgdvh[tshkbhbydlzzndsc]wtjmhgayuizllbngcr[tfglywxclqmgpeatsva]riocgxwsethrhbh[xnerbhkafskywvgxbdl]yzubvjedgzbpqqng\niensavdsekzfncu[frepnzfzbolseio]thbtyqsviqjozgq[mqobufwdnxkzqvqtgj]woxdzihysaypdxamitb[llqsjadcqlogalbice]xwrmwjiednucqqfuy\nlgmcluvxcilrgacyc[ozvsjikotkgiepo]ximiftuuulbsghmm[ykwtdziaokecacpd]bvhsjkjycywcuitep\neoefpqghlbkskrhdhv[wkzmafhoocaswuz]iyiulabsaueugqys\nnoklaptafpgtvzb[hocgskfdbisxdlcdbq]sgwqzdhmwapbbjox[yyjutkzwybpoeea]xtnvxgftzjdwqhgh[nqgarhtwigpfriuq]etonjczcgfhclbf\ntyqqeyfkxjcnjih[edtgzfrlpapwoyrnccx]fmsegnaucwnvsyrsj[lptzjaxumqhbwhmljyv]rugwpouagbvimws\nenpywofbxruqkma[lesuqdferlsfxqis]tqkchirhakakvbgf[ytrxxjwygqwaauwjsg]ncrkbikcmvtbtrabvqb\nnticpuumzthsihk[asrmrtlzizgsvnvcxny]wjntjizixwyedcrh\nyjkotqgkximxcbpa[ttuenysknomggwwvvhe]htzkgoilhlqrpmbcvh[zucaclqaevmjqfuy]pfkvmsbcslkjxyydhk[obfcguogfxfimowk]eczitrwtnkfqyvxco\nnbrsaktghjdxrhul[kmtgawzkmntyypqmw]jggmopgbovomadux[pkwngsqopjftulu]ymmfdmimjpxufntd[hnovhrnfsloivbbueip]oreyglwcjkylphqtwl\nufynjbkocygleqwskw[yuykssufmvmdkdntk]opbcqjxsioqpkzbtuhh\nnkxtoheqxycxqbp[nmjgqytppiuscyylrm]ezhiobiihpmhkqjc[bewnvjufjzxgfwhy]hslvggdrixjquaigzp[dkaylzejrwivzcl]mxzgkigdgfhmczixkrq\nfgcsqpmignjsbxxzt[zoatnmdxtjwltkazbep]wiadjhqakemepgfh[csuxhgjcqjsztsrwb]wdekgrxgngaaqcequ[kjlsrjjtidezpuitng]lhibpbcwjndstunhfff\nozgymklbikxnhme[bbbbemtxaxyxnnazaxm]jszcoclvxluigfgdlq[bkkxgjapnrpvovq]tdsakecfolgpiynztiu\ntytomipjwhuqwshlvho[ewcfspufoolvxmeyodk]wrrxjaexfktctmwrkvc[fwdrputsdfepfvglfq]fqhmqffdtqahfpyelce[elfiaqrgaqxwpjbxcig]jmlxcfxgjkteodsufs\nzdfxveufnuenptljiet[bxzgimeczdpygyen]ptmmjlitdsoncpjlwh\nyfyzedhbbtpqiwmri[uqxjtkmjcivoqatycbc]etqdfgffuplikkgrug[ezipcwmudtfakrrif]kumvfsiqqyfrbcbvgf[upsfgrzgndzpzxhmx]aewrwjwdquhsagmgwah\ntkhbexdnhdkmlogvk[rvuvfkiqrvxwewnhihc]yytysizvrtytoqznokd[cyxenputwxkuesw]qukaxyqfxbjvgdcy[rfvlqyyapixtzghha]sjazfjtokjizlxiim\nynwzzgtnjmfjhbys[enxaumsepjmyaapa]tctribvarqtdaceq[omcmnkckmzjjdhjiwvj]qlkbuktkubixegud[bbvvgpocsbliknv]nivyswbiijvnvvkuw\ndwncikgxhzvktwgwa[nwmhqzwlvntxvjv]dmbsieiwdzgwecq[uvutvspxpxwfafv]vauzasizdqputolg[ncsglnqbwjshyxa]dtgwditcpcuncdcxn\nkupmpwwjcwmmrhum[aakppoytxqucqfncv]gpuyruwkndprpqjqwup[lrcoaodsmpmlhnhnyq]zathwgfvwmumcjwaa\nivdparkbqlazewoujo[tzfulakdrwfncibtnza]titrajiplrfpbsar[rnjnbtkpwadofahdfvv]uwobxeoluadvnxyxwl\nkkoyqwkjdgcvqaufnj[qucvzomguivuynsg]cbhahcwrhchflfuc[czlxnbidfvtovgdl]jmyougddwlejoyrfsfm[kcuqcjogcjrhvjpxx]khnizsdkqwzdzehlpe\nwzeknwbkawxgvgtq[wmypojfjlgomvmk]tfwjzxvhrbxpkuyk\nivalkzrbqzhiqmjo[olluyctvwisrwwt]ndrunxditvvundvd\nzezjmfpqesoftjufk[tdueprzpghkckpq]fnwlbwrhqmmayee\njpmhszgjuxnpjdsbtk[cpzosccgpfbvzuretl]nfpjzsqdvzkcszid[csygzwucakziegi]laqibhadzxurnulc[otxsegwpopkabmwbxzd]ymmsoiqsjnlnsvlsq\nsrgtzegqicrsutbpfsh[wfdoodrpmioayoa]kfqtpkwcfgyvjeyhvsj[yzcyshhziwjudxmm]xnmgrqxumondortjbye[nyajdyykzhnmolyv]zbdkvkbjavamxrafhbl\nifwabdpxckluvreesop[dsyliwtgkelyyam]hqwleigpcnogipr\nbpaukztdyuwjkjrqj[dnslgwpwsanuxvtyn]fxkjtpifmtqzrlok[vfcgvkrunowkiilyok]ypgxcltrqbuzwiqom[ikzgjcafxhxmtgril]btdnvecxukjskjkndz\nnghqjtbvhviyatzaz[guzxivxizjukrxwaf]vtggynfcmuttsnrvm[eqvzxmtlkaigaur]dmfhpohcbyjikjl[kxaapmbxolonwgbw]uektjdecblphouwitdv\nfxefzaiaeclqyvka[srznplyazbvctgfdr]xakjubrnnbfykcep\nrwlthwstbsaxphlsrz[ihywtcvcfdeczmy]lpxfewmiwnskbnv[ripgyxpgczfvxkzp]iltpwldaivxkwwcb[yiejtwqmnnnzywks]krnbkndouhoakztwzh\nmwaxggiakwqnbihaaj[pxslpnutqpgdfvhvwgp]nhhnvftzfwdfnrqisfi[hgroxibwekbugif]btrhjqipvkpfvcf\nxmxlpyuuqssmtmzqyb[ybwrbnrgkansaodfap]cihlwrfxgbaxddtja\nfahbkbakvcwwazgioub[ouuvcmqsmykbkhfhj]gntumiippgacbcl\nhqkuhmrurcqtkzusgu[drwgthikmebvdcjapw]vdxfpjwqlcvwpgsflb[mmaxekmyvkxfxye]nlusofrecbdvhbruu\ntjyqhrxlyrubiuwl[voyszxwudonuwiptjoy]xggibveyrclwxsq[aolwexwhfxpwcuavvwr]bwkkcnpvsiynoeikmlb\ncxpvpcjhfbokvuh[sdkkaewwgkvniqymkrl]emeetymmtcbrivitvn[bvyzmgaorsfbsmqoka]vodjpeovgjpofkq\nnupojuxxbgjvlafg[uhfrugmmacqdsap]nxuunqzbasceyiz[ircwdmgmysazaya]qwsmsdywyhklvniiq\nmxujioozxlybxvyjcmj[afimhsdzsmtxszd]fsckiqksntizegvxgz\nhtyhhcuqdfhhniloe[iqslmejacjbynzkw]nenyirdlormvppyym\njbphnkbvlextsaqnid[xdebmjhugwvnodt]spdqamgmvsuftfx\nmpdupjaxozerpkit[pcivcugsbsqynoz]zrxxjvwswbpuylnxi[tjoxsullllulompfxhy]zobcdnaypuabmzfn[inubfyjlhoysdjath]vufswsypjkekcrb\nqsbiexorinxuevkoad[tjzedsasyapfnvwa]qbfrkhbfmaxcgmovnif[evrexsygnumrldt]serpxomgczhbzjix\nukqzagjymparwzqvw[lnkduutsjulfxuqug]lvupmgsyiquqeepmgsv[ekenewopqmddlcqc]rhnwektxgccickla\nezrytvzepmzxbjapim[knaxuvqciriixgji]epksyimofrrkgawirz[tewvfyplzorvkyeog]bwnejljtelcigsqfx\nfngkrmmwapuutwtn[pjrinpthoymdxemoe]qoxhlklweoscgcagw[pyrevdqrznakburr]fnsowwitbsxsdsdv[hzbrhpemwokvyhpohjw]jppmuxhrsdsmmprl\nwfpphsvqgdaostxg[abwxepvuvujjmdbhees]uxitcdrdkyaqgtyrdr[rqdczpmmmisomtmop]lnqpzuqcyrdgzrcc[cvzwdsaeorgdzzklrx]ekwjqzkeolvlkkqtj\nqzhiltifnugunsngzg[fxfhjhvijjnhnxkbl]bbaftchmgjrfuanns\nisducdmcjzbiacltx[jvkepdvzknnyqegqte]zbuvzcrrsbjsqkf[dowjjsipssfisalqwmk]uzrmibeeevzeuxtb[ajzixsnzrxwpekzpy]weogtsmtsuxvjyhy\ndnxhdwkvawccsfvncy[odsmukbcbpfyjqeau]ugusdxmjuxjosasg[ouwrwzplzttepynf]avhgcbmjesyqkzjgms\npwyizorvifedguhjqrg[zsafqttsqlygzwmqv]hxilzjvsuyfnyck[dnovwvccguuzizrjw]qgbluurgbxnollv\nmeqzvrprpthaebpd[htamsljskphtldx]riagbpmpasjnjefv[cvpfevyvpivbals]tgxiqxmhvqhhmrr[cgeamacqfrlrhaoz]vficakheeoprpbows\nokkhpeexympjqvlamxu[mvjvngmxhkbiaygi]pnwoitpqlyqaiwdpf[ryfcbkcyzbvxuyngw]xxgknvjauivacqxr[tqmanixcxxbolxf]orhkvkwpyrwbymux\nipwcjobowzgrgzmnf[uahjinxxnmyyibzp]badwoisgtafnkgnp\nbcbwbvyvqpozfig[twwsbwyhvfaddwo]jogvkczzowocmkwwlla[yedsazzkeklftvohfqz]tghtcjemmehumuyxar\nbevtohpxkrlrjjen[jxnohlogvkugugmk]nrxomawkgbwlnqwb[rtjoeivssknwelkhv]dihcnpigtbnwfdlxhm\nupuufvskhseazwfttq[kkipejrjmxwmqjsh]xquyqplziwgvkkiyv[iirqohxpmcxsjryb]ajblnptlfnukvae\nsijztjuwnyftelgytm[mgirqlkcbaigiyx]wgbeoandnwaudhgvd[drhbrumogcajpxnvqov]vwandmoxgzsokgfs[xwgtfizcmyjrfzgejhv]nhckviycimfezwefw\ngfgrgtizxajkaicjcc[mftrzuftzrgrwilsv]uckwgxywnamzjglbnts\nznbgncjrhyxaxgd[xyyzkorhakwqubjzk]wrsdvjsrsdorwkgr[krrqukxrdobhkzmr]mdebvnlirbtdbavpj[adbczigmaoreudvgns]yqxeoeccdlpuwyvf\nymjcaobrviuqtvxjqq[jwpvalizcmbpfdjk]wmxpzhqvcavedvmhtn[llsefbpkphhetqhbj]qryznzcexwgvxni\nginmrsljkrcminltayt[iarzxlzixokzfxiazwl]aircthhepljgylm[wlorimkebaxcvcwanlh]bihvjtofcsnvuem\nzdegfhthlaitfojyj[bltnoljmwcfdvle]gnadpzusiepwthtv[ieuoyrprfkwonhwjt]wwfphscvjchvrab\nkdnddjueyrofzhjdzcs[asdqcpbunitvxrwi]usylnhwfapvczeb[ozrrpkegwtbkftyeusg]pncbcdrovovzozcazn\nlkksyjqoayppxtvns[csiuzvhklkfijem]xpsmnkdmivkitka[djmnmzweqxrkfomzqhr]wkzmhoiasanmhez[wojpalkldcaopeg]murhvjrgpwxpbveekq\njawznxjorxwvflmkk[gafmrermlounwjqod]nalazknfqhepgnelal\nwlszezwacdeehnlnoj[njlzbwkfnvnbwim]fydgpvvovkuardng[gqxvckevjodockykp]qsbtvwpwaaeatbd\nbwwttxctuzuezxfdz[apvuanhzemgcupc]qcfxkvevimwvwpu[zhhorxgplrpuyabae]gzabsprhuhwrtkd[sqhumhfqwdgxthu]fyebhdninkahfyy\nhhttjuhgvcgkisaqof[obpleewrfrrsgpumz]umcmeaytqjlqkyrawp[rhkhciyzmxciiysv]kszzqcmcylslhlpqjag\nfnevugmjjescvvmbmt[bjzdquqohnusozz]fwlevkwzllmptbcelsh\nhzqfveaxrqycvuolynx[ztsmaipixbuhbmv]ebvofyoeponbpip\nutmnuyowmxipzhde[yuvqwfsuyhonciiepq]ynjvqvvifywnecwzdk[httqooeiilokkjghwjq]znixikpswkpgxcchuyg\ngoojhvcnizyiukzgmwb[euyvjdmnjjrkjwpu]puidllwqpsddlrhx\nysglduipsofxegb[kzrbdzimejxkyftyuz]aekosjomszyegyy[vpkwocloupebnjeo]ocdaynpnnytwrgkn\nanheyoxddpkmqla[isqzqeuwwitvtqy]jnchwevvrgyznqsomum[kribzkkrxawjnfsmiux]mlerrnvwcydnfckydfm[hwouaafteeabtgflb]acwwvgztxwcanzizha\nkaqernqhzefzthuc[tiuifctajhxawtoi]kyqdkeudzkihvfsn\nvwwekuavrftztxb[aywyoempmajrdkxpsc]eibnjbszsfsapujqn[rxpcsihuzszefcdzl]gsahdvozzgxjhontxk\nymjyffbcgimsalujegr[dnppglortkqlowskj]wxwtxtdaaopcyvp[xfsnsdrlopdotuqx]sprrvphwennltlddiw\nlguyxqxdnirprljpkec[gevtjwbiofgesdwil]phnydixjjjcprpxlpj\nmgjnnftohavesepu[slwhvezajhvdukghl]hdhtlheqzqqrsqmfqyz\niapqmjgrjnecxylopbo[pnbvgmbhbcmcnpsf]opurzpqoyxdxfkud\nefuoofbuyjoaqjd[achnmlslfvovmgt]xcuyvikslsewgqlx[gjxolnhgqhhglojjqhy]iarxidejlgphqwaei\nuxpcurtzqgpgtzkvp[mibqtgwackcedfri]otnnsgolldyzdpbew[tmgiijgjuvjykwahml]xxgjgzmnicxmywdubrb[hwhcgbzhuoankdubft]rxqzywfyuliatahn\nuhmufcxuptehmuf[sygthxldinztzudvs]bdxukzqaxeavvrbqmuz[wovugtpgwisttusjlet]tpfbcndafwhdnolv\nkwknefvhmzbtjezkh[zcvncbptzekirhqo]qvgnyfkmrnxlgxzjjxl[twxzjkybjlrpurfmufa]lclhwuylibekjjxc\nmspxottklkidvlomd[rhiachlbqgpdhfnxyc]ekkxgijnueonlkpfkm[dnwcjiihmpjqtmb]dkknlqniolowydd[dyqofryhvgracxeuivp]pbsgttbtgksqqevytrb\npjvdfpsdlampeztecfq[lpqshzeegwiouas]nwxqaoryigyvbby[iiddsczjoxentwv]weexunkmtaaufurjz[meywmosucyrxzlgxi]huqfmfpxdmcmqfk\nabbhujqyoaphnruaih[yidrkxgrxeoarph]fvryghhzqrobkbsck[dnokdwmkbktlfoihxl]ttptfiadsswiwsfbvf\ndjwqivpbexyvdquh[qmmdydhjbmunyjixviv]nradabzesdavhasjbjs[lsabjblhocebvyhfee]hwbyvnzltgezasg\nmaxofygcnygnwefsb[gdfccusdbseqsqfwva]cxdmwhnjitaazhjftn[kcratndpffdnbopd]wocybndplnotqgctr[ymceqbtulsezvftsi]eggtzhqojksdjapnv\nlzihlroqvmeohnun[wskcytlimfagjyd]tnehibbupupuhepqz[hschjdjtzbvavum]zstmglsltkovvckpmqr\nsyzoikkgzplleoaz[ccpsffhupzpuhjcw]kaswkcoyhlrayhikme[qnjnztjupvbwyns]ggmkqikeziailzpuv[ugqgbpunztgvsxsp]mntxaumliefzkpnia\ndxnkgspqhyejogxstsk[jfgckouqypxttst]axtisjbtaviwafh\nbaxazxlkzlyzvbdvtlc[yhegkwrrluxcnaahyl]nyegiipdjrnjobyjp[ulhbizabyukfvhmdg]hgmxctzxzewckasi[fuvwuolxkcfdkmtcngk]xvmvoydeiuaeawcz\nbkomgyefwkmwwpsayb[rozknmkljogphrqywyo]vlpasefojmrzbpox[epogjnrjrntbcnzha]okfkagkfyagcszueu[gjpfnuvnazbnqylfm]busunenasatqeieestf\ndwlbzijjdujfhotvj[swplsznswlgnaud]bgedlfxgjbwxekq\nffjhdorivdezjdb[tqkfrzxthlxadqstmqe]ttmrscyvbrresartqnh[rfztsxgbedcdecgv]qxcsxdqhshsqtjtl\nzwosebsoogknldkh[mkcucbphbvnaqyxjope]aibznttouadentsy[xfucuvnlnchuawcapcq]jqherkgzqodpzydtgu\nxondkuknycfwyenkceu[ugjlxueqtcyhyhni]bbofydvkhtjgxxnyrc[gpnwoarvjltzyhhe]qebolgjnwnstokco\ncygilweroxmbmbmx[hopxissehjarmezawol]exywzaffjuhehvmbm\nnbndomwcaauiluzbg[qjxqxhccqsvtkwm]oazwbouchccdhtrbnbv[vetwfilwgnxxxrhxar]mrbcnwlpciwpizkxj\nxuabbxdwkutpsogcfea[tgetfqpgstsxrokcemk]cbftstsldgcqbxf[vwjejomptmifhdulc]ejeroshnazbwjjzofbe',
								_1: {
									ctor: '::',
									_0: 'rect 1x1\nrotate row y=0 by 5\nrect 1x1\nrotate row y=0 by 6\nrect 1x1\nrotate row y=0 by 5\nrect 1x1\nrotate row y=0 by 2\nrect 1x1\nrotate row y=0 by 5\nrect 2x1\nrotate row y=0 by 2\nrect 1x1\nrotate row y=0 by 4\nrect 1x1\nrotate row y=0 by 3\nrect 2x1\nrotate row y=0 by 7\nrect 3x1\nrotate row y=0 by 3\nrect 1x1\nrotate row y=0 by 3\nrect 1x2\nrotate row y=1 by 13\nrotate column x=0 by 1\nrect 2x1\nrotate row y=0 by 5\nrotate column x=0 by 1\nrect 3x1\nrotate row y=0 by 18\nrotate column x=13 by 1\nrotate column x=7 by 2\nrotate column x=2 by 3\nrotate column x=0 by 1\nrect 17x1\nrotate row y=3 by 13\nrotate row y=1 by 37\nrotate row y=0 by 11\nrotate column x=7 by 1\nrotate column x=6 by 1\nrotate column x=4 by 1\nrotate column x=0 by 1\nrect 10x1\nrotate row y=2 by 37\nrotate column x=19 by 2\nrotate column x=9 by 2\nrotate row y=3 by 5\nrotate row y=2 by 1\nrotate row y=1 by 4\nrotate row y=0 by 4\nrect 1x4\nrotate column x=25 by 3\nrotate row y=3 by 5\nrotate row y=2 by 2\nrotate row y=1 by 1\nrotate row y=0 by 1\nrect 1x5\nrotate row y=2 by 10\nrotate column x=39 by 1\nrotate column x=35 by 1\nrotate column x=29 by 1\nrotate column x=19 by 1\nrotate column x=7 by 2\nrotate row y=4 by 22\nrotate row y=3 by 5\nrotate row y=1 by 21\nrotate row y=0 by 10\nrotate column x=2 by 2\nrotate column x=0 by 2\nrect 4x2\nrotate column x=46 by 2\nrotate column x=44 by 2\nrotate column x=42 by 1\nrotate column x=41 by 1\nrotate column x=40 by 2\nrotate column x=38 by 2\nrotate column x=37 by 3\nrotate column x=35 by 1\nrotate column x=33 by 2\nrotate column x=32 by 1\nrotate column x=31 by 2\nrotate column x=30 by 1\nrotate column x=28 by 1\nrotate column x=27 by 3\nrotate column x=26 by 1\nrotate column x=23 by 2\nrotate column x=22 by 1\nrotate column x=21 by 1\nrotate column x=20 by 1\nrotate column x=19 by 1\nrotate column x=18 by 2\nrotate column x=16 by 2\nrotate column x=15 by 1\nrotate column x=13 by 1\nrotate column x=12 by 1\nrotate column x=11 by 1\nrotate column x=10 by 1\nrotate column x=7 by 1\nrotate column x=6 by 1\nrotate column x=5 by 1\nrotate column x=3 by 2\nrotate column x=2 by 1\nrotate column x=1 by 1\nrotate column x=0 by 1\nrect 49x1\nrotate row y=2 by 34\nrotate column x=44 by 1\nrotate column x=40 by 2\nrotate column x=39 by 1\nrotate column x=35 by 4\nrotate column x=34 by 1\nrotate column x=30 by 4\nrotate column x=29 by 1\nrotate column x=24 by 1\nrotate column x=15 by 4\nrotate column x=14 by 1\nrotate column x=13 by 3\nrotate column x=10 by 4\nrotate column x=9 by 1\nrotate column x=5 by 4\nrotate column x=4 by 3\nrotate row y=5 by 20\nrotate row y=4 by 20\nrotate row y=3 by 48\nrotate row y=2 by 20\nrotate row y=1 by 41\nrotate column x=47 by 5\nrotate column x=46 by 5\nrotate column x=45 by 4\nrotate column x=43 by 5\nrotate column x=41 by 5\nrotate column x=33 by 1\nrotate column x=32 by 3\nrotate column x=23 by 5\nrotate column x=22 by 1\nrotate column x=21 by 2\nrotate column x=18 by 2\nrotate column x=17 by 3\nrotate column x=16 by 2\nrotate column x=13 by 5\nrotate column x=12 by 5\nrotate column x=11 by 5\nrotate column x=3 by 5\nrotate column x=2 by 5\nrotate column x=1 by 5',
									_1: {
										ctor: '::',
										_0: '(8x10)SBTLHXZP(141x10)(20x4)PSFDROQLSZCXJYTATIBY(2x9)NN(60x14)(3x15)WUO(2x13)WF(10x14)KRXBNHFEGQ(20x4)SWJUMHNRCRJUPDVFAKMI(35x8)(3x14)VZB(8x15)SWKZSEFU(7x1)FZTLTXZ(152x12)(59x6)(1x14)L(13x7)RYXYIAVOQLUDZ(9x13)RJEZMXTNT(1x8)J(7x5)YNAMBOU(1x4)M(65x10)(6x9)FZGSZU(20x15)JOUTNIFMADHRELAZAZXB(4x4)KDHA(12x7)VFVYZLBLKRGG(3x15)SWDGEUSLFVHBFOQCIQFDID(7506x15)(3157x7)(102x1)(95x15)(20x3)(2x6)OJ(7x12)WANSMOE(37x2)(12x2)(6x13)GFVIEP(12x11)XJNOGCDLPZFK(10x6)NZJQDFALQG(4x11)CIRV(527x9)(147x1)(28x7)(22x1)NUVOZARNIUATLYTIIBQQCZ(1x13)X(99x13)(5x15)DVHUQ(74x9)(10x11)JIFYQWJEUE(12x3)ASUFBLKRTQHO(15x3)XSUQBRFDBBILDCE(7x3)SIPAZDJ(1x7)P(3x5)JDH(366x1)(134x10)(12x15)AMZJNEATLPHT(11x5)QLFEIZHQWBC(67x15)(26x12)MMVLATJFCZAVYSWAYBOGXRWACU(27x15)JMSRLPUKKLTVSCAHINZDILQLLUW(18x5)(12x4)LQVHBCGOJYZA(26x10)(19x15)IMYPOULMTQNCVKTTSNV(184x9)(106x8)(23x11)WDRSSBUPTKPJTCWQAGZSRBZ(7x1)TPVSVAQ(11x2)AHULHRROCYJ(2x3)CH(34x7)QXUWECQBZLYQHWTQTNRXQCQYCLBROFJYQO(65x4)(16x5)OGMUNBWDIPYGQHRL(14x11)SGMQCGVBDBQHTZ(3x9)KDB(9x3)NYNNWWEZA(1761x11)(280x2)(108x7)(4x13)NGXY(3x10)BVV(13x3)DMVZONDDQDHDS(7x1)KCUPDYK(52x5)(4x12)XPJZ(6x7)FSTORB(10x11)PPPMLQBXZI(9x1)FMFCFFUTU(31x12)(13x1)BJGZGTZWUIDPO(6x11)NISLLZ(14x2)JAWFAAEDHHVJKE(14x10)(2x11)EB(1x5)Z(80x6)(74x1)(2x2)AP(26x2)ETQQNNOYWDYHUGHQDHPFLXTCAS(5x14)FEZYM(1x3)R(12x8)MDAGWSYTQSGJ(157x4)(68x6)(19x4)(4x7)RFUG(5x6)LJUHK(29x2)(2x14)JP(8x6)LHTUJFVT(3x9)GDY(3x3)LVM(76x10)(16x5)RXLMFXQBRVNONQZE(13x1)JCGQIIIVGOXQG(28x13)TBRCYMNPXBFWTADINKDUSIIWVWKJ(251x1)(181x15)(65x7)(2x9)JS(8x1)DMJXRYWV(9x11)JAFTREIZH(2x13)VI(16x1)MVOHUXRZWUIPDQRX(4x3)SWAW(3x4)FWU(73x1)(11x14)XLPCBJOIVDM(9x6)SUSZQFZKD(6x11)LZCJGL(7x11)IVOPCUS(10x2)WCMTUHFKYN(9x9)REKKFLXDB(56x4)(8x11)JSCOYIUO(16x10)(10x7)POSCVPVGCQ(13x4)MAEVQQGBGWTPJ(326x12)(144x15)(23x2)(10x8)QHBKATXYJO(2x4)BD(15x8)FALUTJDJEUNLFSG(6x8)(1x3)D(3x2)TGW(69x9)(17x9)BRXIVIUJOUWGRBBTP(6x12)IAGHFZ(2x4)NR(2x6)SR(14x3)UKKJAGYGPBQUZB(32x13)DWXVLERHAXVCTKAIUGVJNCBPRNVPKUZC(128x8)(4x5)PRHP(3x15)XYF(55x3)(4x15)SVDY(25x3)IORNPEOSEYLIJBRNQUKEDLPYZ(9x4)YOFZGOUOI(43x8)(29x3)RUIMIMISXBVSCFWRKHUHJVBQJTOWK(2x15)KD(711x7)(142x1)(25x11)(8x12)WHRETAGA(5x11)YRASE(29x13)(13x4)CBFDIYICCDTTJ(4x10)IFVL(5x11)QUQLJ(50x10)(8x14)FUNLAIVW(4x3)RVMC(4x3)DWIO(11x11)CQINFMFXOOX(1x3)Y(62x1)(48x4)(18x10)ORLEMPUSTXIMMDCAOK(1x4)D(11x3)WONNFZQPGXD(2x13)HO(156x8)(25x15)(10x7)JHVPAAMVOL(4x4)VLQZ(81x12)(34x5)STGMRGJQPCLMKMCMOAYAHFLPUSOEKOFXYE(19x9)YAYMXSEDWUJOWJTTMMS(10x4)ZWLMTIMGSJ(30x7)(7x9)WWZRBWD(4x7)BUZZ(4x2)BXVA(197x13)(9x8)(3x14)YNV(14x5)(8x10)GEINIUYR(45x7)(4x12)KNCB(2x3)UT(1x14)R(2x11)SP(8x2)XJLXDKWE(37x5)ZRCRNEVUTWDXHLNJJARHPLZJKPTTUCLWQWATX(62x11)(8x3)ALDXAAEQ(2x15)FL(8x8)QJNQZFPQ(6x1)LKAPCV(10x13)KXWJMGSQOW(119x3)(90x13)(12x9)NYWLXRMORSBF(21x4)BXNONMKXGTOJWEHGTKRGQ(17x13)HPLFMAYPEOAFKQVJX(8x15)EQEMQYUT(1x13)F(15x13)(9x12)UHDEHMMKZ(736x10)(480x1)(92x10)(17x4)GJZPWBSNECJXWLLHV(36x13)(6x10)JODAOK(4x14)JPSM(1x15)H(2x6)NI(8x10)BJBZUQMZ(6x12)ZPWROW(211x8)(77x5)(1x15)U(4x12)IUAY(37x10)KVCKPHSEXYGJCZYAIRNJCZZOQVZMEYDRJARER(4x8)CBXU(2x6)ED(11x11)(6x9)CRFQKF(12x15)GPZGMUVAETKQ(84x15)(10x15)OVNCZYNUUY(35x7)VXZDDZHUTNIAKTPEDXCYFZUGYVPHPIARJYM(6x12)SIUFNZ(9x1)GXDHFDKSW(132x11)(49x1)ZSJMTNGPNQIIWYCWGDYQFEZRHVXNWLGCYQFRMIOXEGSCAPMLX(2x11)RX(4x9)EZFD(53x15)(8x12)WVGWJZVM(9x7)VPUQJWERB(18x11)NJXQTRBJDGLCHQDHEI(17x3)DAOIMIUYPBHLHLREY(222x11)(196x15)(96x6)(21x15)FMLCBALDJJHZFEEQGIOXJ(4x15)ADBM(13x9)BATPQIPKKOQRW(12x7)LKENJLXLNRHU(15x1)CAVXHLDTDMMQHPO(4x12)VVMV(54x10)(8x4)GPMOWNVY(5x14)IFCKU(9x7)EGRBDVKEG(3x3)QAC(3x2)BLT(9x13)JOUHWBQDV(3x8)SOF(12x2)FPPLIAGYYXET(12x15)WRCWYKPWGTQN(936x15)(536x6)(80x11)(73x15)(6x14)STRJOP(28x12)(1x14)U(14x13)RINQHGGUCBSKLL(19x13)YUXWEEJMMQRAUVIDRWM(77x14)(14x10)(9x9)ZVYCUGRJI(50x1)(8x11)MGZUJHNG(21x1)(9x14)FJYLKQLZS(1x5)S(3x14)NBN(229x5)(24x4)PUNXKXDPSYWXQVMXLGTOJILI(115x9)(30x12)(3x8)XZM(8x2)JUXEGHCG(3x13)MRN(7x3)(2x3)FC(28x15)(1x6)M(5x15)FITOA(6x7)PPSHKK(15x2)XSBVRKAPOPEFJNW(4x15)CZMH(71x4)(38x5)JLSITCVCIUMEXUVKUTWUHAJCKEHRKEDWLAPCAV(15x9)TCNFHQCDISVBPZZ(1x9)L(122x9)(1x6)Z(4x10)OEMP(86x11)(80x2)(24x3)HLATVWMPPBESZCTYXGKKURLI(16x15)YJTHARGYCNXZDLZB(11x9)FUTXKYZMHUS(5x5)TTBLR(8x9)PVYNNLXP(385x14)(24x14)IMIPODVZOEYSOIBWKZJGFISM(294x7)(2x10)UI(162x7)(68x7)(37x12)NTPKXSQBVWUBYWBJLERQEEZBPQRZRWXYQOWGV(18x5)IOLEJIUYCJGOWNEESN(1x13)L(21x4)(6x10)BGSJZR(3x12)LSX(47x14)(1x5)T(5x5)SAJGM(15x11)CDUAKTVLZPXGULY(3x13)ABZ(3x6)AKF(102x1)(53x10)(16x10)YUODDQQFXDKWLHDG(6x3)TIHFOK(8x3)VDTFJWZN(1x4)A(35x10)(1x11)V(16x1)YPITMARRAZLDKDWG(1x6)R(46x10)(40x8)(34x2)(28x8)TJDGRRKOKRSQXUTSFFNLAVHOBISQ(15x13)URNDSLWYMINZKAE(3367x9)(1313x1)(371x11)(143x4)(34x11)(22x5)RVJTJNEDGMLNAYEBSSKVOR(1x7)O(16x4)(10x4)PSARQPKWUD(21x4)GCTFJPSLYCDNEATTOROJZ(39x14)(6x13)LNWYOB(4x3)XGZD(12x1)UTSCPUJSKSAK(2x8)JM(5x2)EKVLX(204x7)(86x4)(14x8)JPWIXHZDPQXPCC(1x1)K(45x10)MRFXCXIIETTGXHIQNWBSOQQWTSGBCYKMFACKTDYOTHJBQ(3x5)IET(85x9)(5x5)RFTKZ(20x2)TQDLGPEDZZPASQYQUPUO(2x14)SO(17x11)WDNITLJSNEAGRAMCX(11x8)YCTAQJZBNBE(8x1)(3x6)JCB(2x10)CN(418x2)(250x11)(89x3)(9x2)UGJNLDQXZ(20x1)YQXXUKKYLHELKAXQCXTN(10x1)BBJHQXNWPR(15x9)EHXTDJUDPYSNIFG(6x15)JQUUWU(73x12)(8x12)AZDPTFJE(52x11)IMHXOEKZDPXPWMDZHSMRMWZFKDYAFFDRWERJBPZOTUDLCWFAKVRX(42x14)(11x3)ISRNXOQBDUI(8x8)TNDIUEBL(7x6)ZQEXVLD(20x5)(4x4)CGDU(6x6)DIYBHY(56x6)(2x13)XB(26x10)(1x3)N(4x5)PSNK(5x15)PSYSY(9x13)SAKNLBYHJ(91x15)(11x2)YMQAJMTVQZD(13x7)(8x8)VRZLJWJD(40x15)(6x2)NWQFRQ(1x14)X(16x5)QXJKSSEVSQCFIFUZ(2x12)ON(17x11)ZIXRUSIHDTXUAAMRL(337x11)(136x14)(5x15)MNYAL(9x15)(3x13)PKZ(21x5)(7x4)AISWKGW(3x10)MBL(55x5)(13x6)QFCECSJKZKNMQ(1x5)X(23x11)PQEDJXCBXYYHIHLRKSIKTPT(15x13)ALZNGTVBBMZGTQP(3x14)KIS(78x8)(61x14)(19x6)KFZVHNQMBHEDDMUBDQL(18x11)NNRDUJEZRZZSPBBWAJ(5x10)JGPHQ(4x12)ODHJ(28x11)MWRLKJXCRQMKYUNGKQCGAROEBSOD(59x1)(17x4)(11x9)BZYJIUVALRZ(29x12)(1x4)O(17x1)BCOBLYPJFZDGZSWNB(132x13)(124x14)(23x6)(5x7)WHPBL(8x9)DOXFBTXA(45x14)(5x6)PVAXU(18x8)EMCPMDBCLVNGCQQSEC(5x15)OLOBE(9x15)KAPGMGKXW(22x8)ALYWPEGOJKGQPTQPQYYILD(164x4)(156x15)(20x10)(13x11)HKENJHZGTUUIG(84x10)(6x13)OFCAHG(5x8)JGBXE(6x5)VHJHSU(45x2)(1x11)A(6x6)DZLEJY(10x7)JPRGBWKANZ(5x14)KFPLA(31x15)(24x12)(7x11)SSTERSV(6x2)CRLNYQ(514x4)(285x5)(23x11)(4x10)FOVB(8x1)IBFMETHZ(73x11)(16x9)VGCBQEKJYFSZIGGN(1x7)T(29x1)(4x8)BERJ(4x3)NDLL(5x14)NDGRP(4x15)GHFK(21x1)(14x15)CQOZHUZHNYWIRO(141x4)(70x7)(2x4)QC(4x11)WBZM(22x6)KWZDQFEITIZQXRSTKJTNXZ(18x10)OKLSJFKSMNWWFQPWCQ(16x13)PNWFKSLLLGYXFKFU(36x6)UXHKFFVSFDPUJHJHDYGIQWEVFQVDUQOSIOPI(214x10)(6x13)FHQVTQ(2x4)UU(133x2)(3x13)KUL(10x10)YGMYBMBZLK(51x3)(10x12)VHODIYLUDH(14x10)MSGWYHUNGTXOTR(1x8)Y(2x5)NG(44x2)(3x7)JQT(30x8)GQBSIDPWDGVJDGGNRMZHOKMHFFKUJG(40x7)(20x10)(14x7)NEHQVHZJWKXCMD(7x13)FHQCJES(4x6)NNLG(1345x12)(214x11)(2x4)PT(193x9)(7x9)(1x14)X(104x12)(8x4)QFSSDKKU(12x13)LBRRJIYLPVZP(3x13)SCF(38x9)ZATOROAVMBHFQKKPSJQBBVFQYOFZHOIQZCAZAE(13x5)HDBQATTHPFAJU(62x10)(8x5)LJIPZICO(5x7)TIKGZ(15x4)FNTJFQIFZCGMDQL(7x4)NWQFWQA(1x1)D(2x2)SA(362x2)(50x13)(44x4)(18x10)XUKEPXLPXMLURCVSNA(7x15)CQSFEDB(1x7)P(86x6)(42x8)(6x15)PLRMVD(3x6)FAA(8x9)HSYDKIYH(4x6)CMUS(7x9)HTODFBQ(6x11)CHBYPI(1x5)B(3x3)IJA(76x5)(29x9)UAJNFBEXTSFEGYMJOZJNPKXADGQFU(34x14)(14x9)BMLKJBLZCTXCGC(2x13)UH(1x6)O(123x12)(46x13)(12x2)AMANHATHZJLR(3x7)AGG(9x6)YNFJXYGOR(1x5)K(50x8)(2x14)DY(5x4)IAQXY(25x15)OPPQMYAUSIQKNGJXIEWWUBIBJ(8x11)FTKTBRPA(63x14)(6x10)ZXWXAE(45x1)(20x13)(13x12)WSQQVGCIGVLXW(12x5)HJJJANWCFKOE(347x4)(3x11)XTH(1x4)B(16x3)GUAMQZWPSPKUKRHG(303x3)(3x5)IUA(107x14)(24x5)QKTPEKPOULAJEANONWICQVRH(4x9)VJMW(21x5)CIRVPAYPUVCAPGEDXJRJS(14x13)CUWRSISDMETQPB(13x15)KYCFHOIFHCKYO(68x1)(16x6)EODWCYHGQKKLUCBB(20x2)GWBSKULZNXSSSFZEJCZM(4x5)PECS(5x14)ROEJN(36x4)(17x7)PDYTFSNAAAJSKSGOS(7x12)RCCFUAR(58x8)(4x14)RBYW(1x14)K(34x14)SMTABOIPSIRRKKJTUCGXEJHOWDZWSBPUCV(323x7)(74x3)(68x4)(21x15)OXUBNXBUGOGHZEWAWDHRJ(23x13)UQYSTJYAKTUHCHSWCFDDRKZ(5x7)VXJOH(13x15)(8x9)EOCNIGWT(216x6)(60x13)(8x10)HMZCAJPF(13x15)DPZYCBQBJGMMC(9x13)PZPCYYLQC(5x13)GOBQG(62x10)(5x2)ZYTKA(9x5)YINOLVDPX(2x9)GH(6x2)VPHEBS(14x1)ULSCHAQADYEMNL(18x10)VKGGGWALFICNIDBBQB(15x3)RIAXMZCHSROTHEN(27x12)AUTBVRMCQKYGMABAUVFGHFBHUFB(2334x9)(2326x1)(4x7)MBKL(144x11)(2x13)UF(3x7)KTS(13x12)PBBVVBSUTJBMU(100x10)(20x14)AWSXELWFDUNLVYIITNOI(66x12)(10x8)YFGDFSIHAY(4x12)IVYI(34x4)ZOIMKLDVRDMGVNXHVSAQPXASOKAPFFCOYM(618x9)(44x13)(11x8)SSYZXHWKGDP(12x12)DAZCEESYDHGU(3x1)WJZ(287x10)(12x4)(6x10)RJCQRG(7x13)(2x2)JD(22x8)(3x11)ZWO(8x4)(2x14)DH(147x3)(112x4)(1x8)T(9x10)QKFRAICSR(11x6)NXHLSBTTOJT(22x1)OSYERWMCHRVVTMCQSLJWLE(39x12)DRUDTGZKTPOEHPTIDIOMCHRUTNMJMDOVLPLOJHU(5x1)GJALO(12x3)WHLTYMOAPKDB(68x1)(6x5)WTIQWJ(38x11)(1x11)S(1x11)C(18x1)UDTTHQUZLAZJJYBFWP(7x6)BAOOJVK(264x13)(78x11)(2x7)KU(16x15)(5x5)HWGHC(1x2)M(4x12)UZJB(23x8)OEFBFIBTJTPXBYNRAHNENLR(4x6)UQRH(22x5)CXMJULOWAXJQZYOJSBMMCH(3x14)QIB(135x9)(7x2)CHUACEG(76x6)(1x2)O(11x2)QWYBYXEHPWY(6x8)DVSMDT(5x2)PDQBI(26x7)USTGHYJTBDCKDYMEKDDCWLRJSR(35x4)(1x8)Z(7x1)OKCPSGK(3x3)YKB(4x1)JHYV(1457x13)(414x3)(156x1)(21x9)GTFEMIWUFPZKXTAPAWFSA(10x6)(5x2)BWQXU(12x10)(7x6)HIFJYHN(7x7)WAYKJZM(75x15)(50x8)VFOJKTCXBBJDQLXMJQMHNJEFOHCWTEBBBHPLFVNCDVZVUVBRFN(4x1)HLBI(5x8)NBWBW(100x15)(36x8)(6x11)QRXGWV(2x15)LM(10x2)GENWUHMDHD(43x5)(6x6)XNXOQQ(14x13)DRBVVIPKSABCRK(6x7)OOGXBK(4x8)SPIZ(84x3)(10x15)BYCCWQYTGJ(15x2)JBUWSONDXDCHCLM(10x7)GICEAFHGCP(15x11)KPOGQBLDRGMDFMI(3x5)QPL(39x9)(13x8)CNRCEVUGECJKI(6x14)KAGRWL(3x9)UNS(2x13)KD(619x9)(41x4)(1x9)R(2x5)NW(5x14)HWCSS(5x1)YBDZS(2x9)YJ(22x9)PHTCJUSABRDAEYBZPOCJCA(137x2)(3x3)TDU(6x4)(1x6)M(4x5)HOLX(79x6)(16x7)RPSBDBXECFKNNYLH(2x4)XA(10x8)HFRCAIFRAR(18x3)YTJLNOPXAFNNWCPDLO(5x9)DVQZD(18x3)ZHIWWLVSQRVDDMCYHG(294x6)(51x1)(14x14)AADOHYXXSTVMYA(5x3)VCFNJ(8x15)SMCJHLWX(1x6)Y(28x9)ALLKXWTHFJMHVGUGTNMTJXDQHJQK(51x1)(5x7)XTDMB(4x2)HIXL(11x3)CYHOTFMJWEY(2x13)IW(1x14)K(94x13)(17x6)BMSVGSGVTQFYIHFUC(10x6)IZCKUYSXAS(24x2)HTRZUXEQSQFRMLXGEZRXBPBQ(19x5)SBLVIBEJDIUAHLEENEY(38x15)(14x1)AZJFPUGHFZHBUV(12x1)XARJBQCUZROW(92x14)(3x2)DLJ(77x14)(8x5)ODSGDCXG(45x1)USLSTAPOEHYFPHWTELAPRSUCLSOQRZAYCAFBNVVHPOYPN(8x4)LSKEJHBQ(402x15)(226x13)(49x9)(4x2)TMXR(10x14)ITPKFJTHQW(2x9)OT(2x4)PH(4x6)XKXF(8x11)WTPGIKKA(26x14)NPNESBFESFSYVCAKWBOMWGYOCY(25x5)GSIEXJLWCRUOLPPCXBYMMMABY(86x14)(44x4)JVZTPHBJEPTXZHGWEDJUXBHTYWHOOMQPHDUMNJYBLUOZ(3x2)NIC(22x5)XPLBTHANGNMJRHJQWGPEYT(24x4)(18x6)(1x3)C(6x10)ERGVZB(3x4)CLU(123x4)(68x11)(8x15)UZRAWQZA(7x1)EYVNGTB(19x4)ZSLMVPWFCLAXWWMGTDY(10x12)TZGVWMOACQ(42x5)(9x11)JDPLVZOKP(7x4)AWMDYVD(9x15)DNAKSRSHQ(68x6)(17x13)(11x6)PYTCFBZWKKQ(4x12)EGHM(28x2)(3x11)WKR(13x7)(7x11)EGIIRTL(3754x12)(841x7)(226x6)(92x2)(42x14)(35x13)(10x5)IHMSJKHNJH(8x8)MYREBDDD(1x2)K(8x14)NSKZICAQ(22x10)VQUOMCIZTLWIAAIWMTMZYU(33x9)(26x11)MTCNPWASYTLWFUHVZJSMLSUYGL(1x4)S(17x13)(1x7)H(5x14)NDMFV(53x2)(47x7)(22x4)(7x12)PLHZPTA(4x6)ULAX(13x3)DTIAMKYKISRWD(600x15)(109x11)(1x15)R(27x1)(21x7)QSXFHGBHUWWRPCQFROTIY(43x15)(37x4)(8x4)AMTRDOPK(1x2)C(2x7)EN(6x8)YPBIHN(12x14)(6x12)(1x7)F(112x4)(8x9)(2x10)UX(25x2)(2x14)RZ(10x11)(5x7)HTWSD(62x6)(8x13)HUVCCWAM(4x15)RIVP(24x8)(17x13)IFHANRZFDUPOQPWTT(2x10)QT(158x6)(39x15)(10x15)VJPMYZOSCZ(15x15)GEBYKNEHPBVINHM(104x15)(27x1)(13x8)JJELZPJPUVIHJ(2x14)HF(53x10)(9x3)LLJKUEWAP(18x11)MEGYUDUSKJMJSTKZZH(8x10)IWVCLWMD(5x10)IIUWM(191x15)(85x6)(2x12)AE(7x14)YQMQGFX(49x3)(14x12)OIELHKYHJBXCLN(3x11)AXZ(13x9)GHKWSKUKKFLSU(4x6)FJTL(83x8)(76x10)(7x10)ZMMYVDK(17x14)LLOEBHBFDUJTZZWGU(18x13)SPSLVSQOYQXXWRRIMJ(2x6)AM(1x13)B(6x6)DBAFCH(830x4)(5x11)NZMBE(694x8)(6x8)GASDHC(394x6)(116x4)(11x1)KYJSDFYYPTP(8x14)(3x6)YZR(27x15)(3x8)PSG(12x10)LDDRMGPCXCMF(45x2)(2x2)JA(4x3)SRWC(1x9)O(16x13)TTLQKIIAXRKIZCUX(170x7)(13x11)ZSFACAKVMHGKS(81x4)(18x11)CPRUPOJQIBQLMYWCDE(4x3)JYGV(6x1)DAOQQV(19x5)CBPXMEDDMLMTGFRGPNC(6x8)VKCUIG(36x12)(8x8)HCVTWURX(9x7)QNLBGVJVD(4x3)ODRF(13x13)YKOQVADTVQMZK(77x13)(24x10)OYMPLHCMYYIYNJHCPXPDEGZQ(11x8)(5x15)FPMPB(23x6)(9x1)PCRDMMYDH(4x7)CENS(4x11)MPFK(9x6)(3x11)UUP(7x1)UWNYVWB(249x1)(218x1)(17x15)(11x6)VXVQAYOOIBE(131x12)(39x6)IEQHFDHCTJFPUDVGYRJPCYBCYZZFXYGRXDSCZCD(20x12)OOBXCYQYLZPBJWIBUWAA(12x8)ZHGJPKBWGXFR(25x4)OVARPSETFFMCSCPIXEGOHNUMN(4x11)RDCT(6x15)QLPQFC(36x12)(16x15)CJKGEQXTSINHPHMA(7x11)KSPSOUR(18x4)(12x9)ZTGAJDNSXHDU(111x7)(11x4)CYKIOBNFEGD(31x6)(25x2)(18x14)FGRTQESRFJGZMPNRUN(50x13)(2x2)KN(36x15)(10x4)OTUOCXHNHE(14x7)(9x8)FVRRYRFPO(224x13)(184x5)(163x8)(59x15)(7x10)LOQHMYI(22x6)(7x1)KXLOUFK(4x13)WVDI(12x2)EMXIDRTROLVC(6x10)VAHMFC(52x2)(32x15)(5x14)MAAIY(3x9)NHF(8x5)PRXKOTOR(8x2)KPTWMWKG(20x13)(8x2)PJBVGWST(1x15)R(9x1)HWFCLYOKN(27x9)(21x2)(15x6)KLJZECQKWNHWWIX(1829x2)(858x1)(12x3)KYUBBBZCYFTV(572x14)(209x15)(7x7)BGVNUYS(120x6)(9x10)RXUIJCOPN(42x15)CKKAHJSLICNUMZBKJCGDHWBCLBPUIUMAZXPXPFVTHM(5x6)NPKXA(21x2)XHXEDIXBPYQYWPAZVKTUM(12x12)JDKTGKJIPCTF(54x14)(12x1)QUDHNAYHAHXC(8x11)GPYLPFKM(8x14)AOYOVEEY(2x12)QU(3x14)GHB(130x6)(57x10)(22x12)CNNNBZZGWYXBXUMRRZMKUM(11x15)LIMWQEKCDUS(4x12)FVUJ(11x7)ULQLRKALJNX(43x4)(2x13)DU(3x2)ZWU(5x13)PIBIP(10x6)TADCHNVNWH(30x1)(1x11)I(6x13)PDQHWL(6x3)JPNNIZ(94x11)(17x8)BYMTFVMEQZUENZEDY(1x11)Y(1x3)E(52x7)(10x11)JUOMLTDPYV(6x4)VWFWSC(18x2)PEZNNWKQMIXMNMFFYV(74x14)(18x9)WSVCADWAXYSLVEXXKY(43x11)TDYRTWYPRFOJOFNNFRQAXHOYESCRESIGVPEZAQNYUZU(223x8)(36x1)(30x7)(6x13)JEMNDE(6x1)KMNDNG(1x15)P(1x7)P(167x14)(53x9)(8x11)AXHMYSMF(16x8)IBSDRSKDWAVAGHAY(10x14)WCBNJVKQFE(56x13)(18x5)CMRBGHIWNSWOFEJAKZ(2x2)ES(19x5)BGAPIYECLXZKKWQDXKJ(39x6)(1x7)Z(27x5)HJVHXJAYRJGPQJPRVLBPGNHEGAO(11x11)WSMGKGFWEZS(7x9)SMDWJAK(172x7)(137x11)(7x5)(1x12)Q(118x6)(12x1)WKMCAUMANQPO(32x3)(3x13)KUP(17x2)PIUKNKTOJQBFFBHMD(11x3)(5x12)NPDJH(39x3)(14x14)FAUXDEDTYTBXQW(6x4)ULEQRI(2x1)UG(13x2)(8x8)XLEBSQDT(2x14)HB(92x8)(8x15)(3x8)CUO(10x11)BUXSIQMEBN(41x7)(2x13)BP(8x3)KZYDBTOB(14x5)(8x12)WDFBJBUY(8x10)(3x2)EVB(1x8)L(673x14)(191x5)(7x11)OIXREMH(96x4)(16x10)(1x11)X(4x1)NIIY(23x14)(7x7)SUOVJAS(6x2)QVNPXW(1x15)L(8x6)QSUBGSRH(17x6)ZCJDKVWHBJCBXLCBZ(70x1)(8x15)AXEHKIMF(9x12)PWRLXCFMC(34x14)(5x3)EWDOK(12x3)CPWNFYUDJJII(1x6)U(468x4)(93x6)(11x3)LORBJPLKIEE(70x7)(8x6)RLAJDPIA(19x13)ZEZQMCDWLCEKPPEOPEO(4x12)HFTE(1x15)B(8x13)NJOEQIQR(95x4)(16x1)HJJJXFVITXCGUJCV(31x10)(24x11)MWPVFJPXBSGQRJSWYAXIDSXM(9x4)(3x12)UBL(15x3)TDTSFTMOCTLLGTT(88x3)(81x12)(7x13)EFFHSFR(2x3)NC(11x4)TNOIEFYHLCF(1x12)C(31x5)HCJAHWAPMFTZZFLFLJKHBGEVNHRSZLV(19x3)XETTDXQVOIZAYXNRFWG(141x12)(103x7)(21x13)XIEYNXAJUFPHYKYFMKSQM(11x13)SVAGUZYMBQY(5x8)GIDXD(40x10)XGWDXONEBMYPNHYZXSFDCCZAWZZHEZDCIHXWOCCL(15x11)QNPTGVVIIVAMPRM(4x8)VMWF(162x5)(80x3)(22x2)CLKCVKOZJBGFCWOCQFTNDV(1x9)H(18x8)YOGCMNFKXHEYWAAWFN(3x8)UNJ(9x1)MDFWYEOLI(9x9)(4x7)PLON(1x9)M(35x12)(20x5)LOJPXVGMNSOWMMEOSIND(3x14)YAQ(9x3)QPHIIRVXX(69x4)(34x6)(16x1)ADEAXTGJETYMXQLE(6x11)OKLRKI(10x4)DIRSNHOBJM(8x5)ABWMLTWW(7x13)AJTDYZC(23x5)LSLRJJOHFVRITWVIKBZLILU',
										_1: {
											ctor: '::',
											_0: 'bot 171 gives low to bot 4 and high to bot 84\n          bot 1 gives low to bot 117 and high to bot 81\n          bot 82 gives low to bot 209 and high to bot 103\n          bot 128 gives low to bot 56 and high to bot 91\n          value 23 goes to bot 8\n          bot 7 gives low to bot 148 and high to bot 22\n          bot 179 gives low to bot 91 and high to bot 77\n          bot 158 gives low to bot 125 and high to bot 143\n          bot 190 gives low to bot 26 and high to bot 100\n          bot 32 gives low to output 12 and high to bot 6\n          bot 115 gives low to bot 126 and high to bot 38\n          bot 101 gives low to bot 202 and high to bot 66\n          bot 143 gives low to bot 169 and high to bot 76\n          bot 31 gives low to bot 109 and high to bot 95\n          bot 103 gives low to bot 9 and high to bot 171\n          bot 180 gives low to bot 137 and high to bot 93\n          bot 73 gives low to bot 21 and high to bot 19\n          bot 91 gives low to bot 18 and high to bot 58\n          bot 49 gives low to bot 85 and high to bot 188\n          bot 41 gives low to bot 69 and high to bot 203\n          bot 10 gives low to bot 31 and high to bot 94\n          bot 29 gives low to output 9 and high to bot 164\n          bot 44 gives low to bot 194 and high to bot 180\n          bot 157 gives low to bot 67 and high to bot 14\n          bot 104 gives low to bot 114 and high to bot 149\n          bot 183 gives low to bot 201 and high to bot 151\n          bot 138 gives low to output 19 and high to bot 37\n          bot 21 gives low to bot 98 and high to bot 205\n          bot 9 gives low to bot 36 and high to bot 4\n          bot 136 gives low to bot 87 and high to bot 196\n          bot 99 gives low to output 20 and high to bot 96\n          bot 142 gives low to bot 27 and high to bot 116\n          bot 42 gives low to bot 118 and high to bot 104\n          bot 108 gives low to bot 64 and high to bot 42\n          value 7 goes to bot 157\n          bot 159 gives low to bot 78 and high to bot 192\n          bot 81 gives low to bot 124 and high to bot 3\n          bot 148 gives low to bot 96 and high to bot 146\n          bot 107 gives low to bot 49 and high to bot 48\n          bot 38 gives low to bot 177 and high to bot 200\n          value 43 goes to bot 106\n          bot 28 gives low to bot 70 and high to bot 79\n          bot 172 gives low to bot 106 and high to bot 190\n          bot 162 gives low to bot 158 and high to bot 59\n          bot 208 gives low to output 4 and high to output 13\n          value 47 goes to bot 21\n          bot 124 gives low to bot 79 and high to bot 83\n          bot 206 gives low to bot 196 and high to bot 55\n          bot 17 gives low to bot 65 and high to bot 187\n          bot 144 gives low to bot 46 and high to bot 107\n          bot 154 gives low to bot 195 and high to bot 78\n          bot 106 gives low to bot 72 and high to bot 26\n          bot 186 gives low to bot 14 and high to bot 209\n          value 67 goes to bot 10\n          bot 187 gives low to bot 123 and high to bot 193\n          bot 5 gives low to bot 136 and high to bot 206\n          bot 166 gives low to bot 61 and high to bot 85\n          value 37 goes to bot 32\n          bot 198 gives low to bot 76 and high to bot 71\n          bot 97 gives low to output 18 and high to bot 129\n          bot 139 gives low to bot 108 and high to bot 88\n          bot 192 gives low to bot 131 and high to bot 89\n          bot 174 gives low to bot 80 and high to bot 127\n          bot 92 gives low to bot 11 and high to bot 7\n          bot 94 gives low to bot 95 and high to bot 183\n          value 5 goes to bot 98\n          bot 72 gives low to bot 207 and high to bot 43\n          bot 12 gives low to bot 68 and high to bot 195\n          bot 156 gives low to bot 89 and high to bot 1\n          bot 188 gives low to bot 197 and high to bot 64\n          bot 3 gives low to bot 83 and high to bot 105\n          bot 77 gives low to bot 58 and high to bot 41\n          bot 11 gives low to bot 99 and high to bot 148\n          bot 55 gives low to bot 45 and high to bot 44\n          bot 66 gives low to bot 5 and high to bot 141\n          bot 23 gives low to bot 48 and high to bot 139\n          bot 18 gives low to bot 39 and high to bot 174\n          bot 40 gives low to bot 190 and high to bot 39\n          bot 90 gives low to bot 179 and high to bot 36\n          bot 196 gives low to bot 92 and high to bot 45\n          bot 79 gives low to bot 162 and high to bot 147\n          value 2 goes to bot 172\n          bot 135 gives low to bot 133 and high to bot 168\n          bot 117 gives low to bot 28 and high to bot 124\n          bot 118 gives low to bot 13 and high to bot 114\n          bot 26 gives low to bot 43 and high to bot 12\n          bot 185 gives low to bot 32 and high to bot 34\n          value 61 goes to bot 207\n          bot 193 gives low to bot 101 and high to bot 132\n          bot 16 gives low to bot 186 and high to bot 82\n          bot 93 gives low to bot 144 and high to bot 60\n          bot 116 gives low to bot 155 and high to bot 57\n          bot 39 gives low to bot 100 and high to bot 80\n          bot 131 gives low to bot 173 and high to bot 74\n          bot 133 gives low to output 11 and high to bot 20\n          bot 137 gives low to bot 33 and high to bot 144\n          value 11 goes to bot 52\n          bot 105 gives low to bot 62 and high to bot 122\n          bot 126 gives low to bot 25 and high to bot 177\n          bot 78 gives low to bot 75 and high to bot 131\n          bot 132 gives low to bot 66 and high to bot 167\n          bot 202 gives low to bot 181 and high to bot 5\n          bot 27 gives low to bot 163 and high to bot 116\n          bot 173 gives low to bot 193 and high to bot 63\n          value 41 goes to bot 112\n          bot 13 gives low to bot 182 and high to bot 50\n          bot 59 gives low to bot 143 and high to bot 198\n          bot 123 gives low to bot 200 and high to bot 101\n          bot 182 gives low to output 2 and high to bot 97\n          bot 112 gives low to bot 8 and high to bot 15\n          bot 86 gives low to bot 164 and high to bot 166\n          bot 201 gives low to bot 82 and high to bot 151\n          bot 62 gives low to bot 198 and high to bot 122\n          bot 65 gives low to bot 38 and high to bot 123\n          bot 165 gives low to bot 121 and high to bot 110\n          bot 197 gives low to bot 37 and high to bot 111\n          bot 69 gives low to bot 127 and high to bot 0\n          bot 57 gives low to bot 81 and high to bot 3\n          bot 168 gives low to bot 20 and high to bot 170\n          value 31 goes to bot 31\n          bot 6 gives low to output 7 and high to bot 133\n          value 3 goes to bot 72\n          bot 67 gives low to bot 204 and high to bot 161\n          bot 35 gives low to bot 30 and high to bot 11\n          bot 14 gives low to bot 161 and high to bot 90\n          bot 175 gives low to bot 157 and high to bot 186\n          bot 96 gives low to output 1 and high to bot 29\n          bot 170 gives low to bot 51 and high to bot 176\n          bot 68 gives low to bot 191 and high to bot 17\n          bot 209 gives low to bot 90 and high to bot 9\n          bot 150 gives low to bot 168 and high to bot 119\n          bot 203 gives low to bot 0 and high to bot 27\n          bot 2 gives low to output 3 and high to bot 208\n          bot 50 gives low to bot 97 and high to bot 24\n          bot 161 gives low to bot 128 and high to bot 179\n          bot 167 gives low to bot 141 and high to bot 158\n          value 73 goes to bot 112\n          bot 163 gives low to bot 156 and high to bot 155\n          bot 4 gives low to bot 178 and high to bot 84\n          bot 147 gives low to bot 59 and high to bot 62\n          bot 25 gives low to bot 135 and high to bot 150\n          bot 121 gives low to bot 160 and high to bot 110\n          bot 169 gives low to bot 44 and high to bot 47\n          bot 75 gives low to bot 187 and high to bot 173\n          bot 120 gives low to bot 176 and high to bot 87\n          bot 177 gives low to bot 150 and high to bot 102\n          bot 37 gives low to output 16 and high to bot 134\n          bot 149 gives low to bot 24 and high to bot 130\n          bot 34 gives low to bot 6 and high to bot 135\n          value 71 goes to bot 109\n          bot 43 gives low to bot 199 and high to bot 68\n          bot 145 gives low to bot 139 and high to bot 88\n          bot 84 gives low to bot 140 and high to bot 142\n          bot 20 gives low to output 8 and high to bot 51\n          bot 95 gives low to bot 16 and high to bot 201\n          bot 61 gives low to output 5 and high to bot 138\n          bot 83 gives low to bot 147 and high to bot 105\n          bot 46 gives low to bot 166 and high to bot 49\n          bot 153 gives low to bot 93 and high to bot 160\n          bot 71 gives low to bot 152 and high to bot 165\n          bot 48 gives low to bot 188 and high to bot 108\n          bot 98 gives low to bot 185 and high to bot 184\n          bot 70 gives low to bot 167 and high to bot 162\n          bot 195 gives low to bot 17 and high to bot 75\n          bot 205 gives low to bot 184 and high to bot 126\n          bot 24 gives low to bot 129 and high to bot 130\n          bot 60 gives low to bot 107 and high to bot 23\n          bot 51 gives low to output 6 and high to bot 189\n          bot 45 gives low to bot 7 and high to bot 194\n          bot 164 gives low to output 0 and high to bot 61\n          bot 8 gives low to bot 10 and high to bot 15\n          value 19 goes to bot 67\n          bot 181 gives low to bot 120 and high to bot 136\n          value 13 goes to bot 204\n          bot 114 gives low to bot 50 and high to bot 149\n          bot 113 gives low to bot 52 and high to bot 56\n          bot 30 gives low to output 14 and high to bot 99\n          bot 63 gives low to bot 132 and high to bot 70\n          bot 80 gives low to bot 154 and high to bot 159\n          bot 53 gives low to bot 23 and high to bot 145\n          bot 125 gives low to bot 55 and high to bot 169\n          bot 56 gives low to bot 40 and high to bot 18\n          bot 54 gives low to bot 192 and high to bot 156\n          bot 155 gives low to bot 1 and high to bot 57\n          bot 102 gives low to bot 119 and high to bot 181\n          bot 151 gives low to bot 103 and high to bot 171\n          bot 200 gives low to bot 102 and high to bot 202\n          bot 0 gives low to bot 54 and high to bot 163\n          bot 191 gives low to bot 115 and high to bot 65\n          bot 119 gives low to bot 170 and high to bot 120\n          bot 207 gives low to bot 73 and high to bot 199\n          bot 184 gives low to bot 34 and high to bot 25\n          value 59 goes to bot 73\n          bot 130 gives low to bot 2 and high to bot 208\n          bot 111 gives low to bot 134 and high to bot 13\n          bot 15 gives low to bot 94 and high to bot 183\n          bot 146 gives low to bot 29 and high to bot 86\n          bot 58 gives low to bot 174 and high to bot 69\n          bot 189 gives low to output 15 and high to bot 30\n          bot 33 gives low to bot 86 and high to bot 46\n          bot 100 gives low to bot 12 and high to bot 154\n          bot 160 gives low to bot 60 and high to bot 53\n          bot 129 gives low to output 17 and high to bot 2\n          bot 87 gives low to bot 35 and high to bot 92\n          bot 64 gives low to bot 111 and high to bot 118\n          bot 134 gives low to output 10 and high to bot 182\n          bot 122 gives low to bot 71 and high to bot 165\n          bot 178 gives low to bot 41 and high to bot 140\n          value 29 goes to bot 175\n          bot 19 gives low to bot 205 and high to bot 115\n          bot 47 gives low to bot 180 and high to bot 153\n          value 17 goes to bot 113\n          bot 176 gives low to bot 189 and high to bot 35\n          bot 88 gives low to bot 42 and high to bot 104\n          bot 199 gives low to bot 19 and high to bot 191\n          value 53 goes to bot 185\n          bot 22 gives low to bot 146 and high to bot 33\n          bot 52 gives low to bot 172 and high to bot 40\n          bot 141 gives low to bot 206 and high to bot 125\n          bot 152 gives low to bot 153 and high to bot 121\n          bot 140 gives low to bot 203 and high to bot 142\n          bot 85 gives low to bot 138 and high to bot 197\n          bot 89 gives low to bot 74 and high to bot 117\n          bot 109 gives low to bot 175 and high to bot 16\n          bot 36 gives low to bot 77 and high to bot 178\n          bot 76 gives low to bot 47 and high to bot 152\n          bot 194 gives low to bot 22 and high to bot 137\n          bot 110 gives low to bot 53 and high to bot 145\n          bot 74 gives low to bot 63 and high to bot 28\n          bot 204 gives low to bot 113 and high to bot 128\n          bot 127 gives low to bot 159 and high to bot 54',
											_1: {
												ctor: '::',
												_0: 'Input manually coded',
												_1: {
													ctor: '::',
													_0: 'cpy 1 a\ncpy 1 b\ncpy 26 d\njnz c 2\njnz 1 5\ncpy 7 c\ninc d\ndec c\njnz c -2\ncpy a c\ninc a\ndec b\njnz b -2\ncpy c b\ndec d\njnz d -6\ncpy 18 c\ncpy 11 d\ninc a\ndec d\njnz d -2\ndec c\njnz c -5',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
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

var _user$project$PixelatedScreen$toElmCoordinates = F2(
	function (_p0, screen) {
		var _p1 = _p0;
		var yOffset = (_p1._1 * (0 - screen.pixelSize)) - ((screen.pixelSize / 2) | 0);
		var xOffset = (_p1._0 * screen.pixelSize) + ((screen.pixelSize / 2) | 0);
		return {
			ctor: '_Tuple2',
			_0: ((_elm_lang$core$Basics$toFloat(screen.canvasWidth) / 2) - _elm_lang$core$Basics$toFloat(xOffset)) * -1,
			_1: (_elm_lang$core$Basics$toFloat(screen.canvasHeight) / 2) + _elm_lang$core$Basics$toFloat(yOffset)
		};
	});
var _user$project$PixelatedScreen$toCoordinates = F2(
	function (screen, bufferPos) {
		return {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$Basics_ops['%'], bufferPos, (screen.canvasWidth / screen.pixelSize) | 0),
			_1: (bufferPos / ((screen.canvasWidth / screen.pixelSize) | 0)) | 0
		};
	});
var _user$project$PixelatedScreen$updateBuffer = F2(
	function (screen, buffer) {
		return _elm_lang$core$Native_Utils.update(
			screen,
			{buffer: buffer});
	});
var _user$project$PixelatedScreen$moveTo = F4(
	function (screen, x, y, form) {
		return A2(
			_evancz$elm_graphics$Collage$move,
			A2(
				_user$project$PixelatedScreen$toElmCoordinates,
				{ctor: '_Tuple2', _0: x, _1: y},
				screen),
			form);
	});
var _user$project$PixelatedScreen$getBufferRow = F2(
	function (y, buffer) {
		var _p2 = A2(_elm_lang$core$Array$get, y, buffer);
		if (_p2.ctor === 'Just') {
			return _p2._0;
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'PixelatedScreen',
				{
					start: {line: 43, column: 5},
					end: {line: 48, column: 67}
				},
				_p2)(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Screen out of bounds y: ',
					_elm_lang$core$Basics$toString(y)));
		}
	});
var _user$project$PixelatedScreen$getColorAt = F2(
	function (_p4, buffer) {
		var _p5 = _p4;
		var _p8 = _p5._0;
		var row = A2(_user$project$PixelatedScreen$getBufferRow, _p5._1, buffer);
		var _p6 = A2(_elm_lang$core$Array$get, _p8, row);
		if (_p6.ctor === 'Just') {
			return _p6._0;
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'PixelatedScreen',
				{
					start: {line: 57, column: 9},
					end: {line: 62, column: 71}
				},
				_p6)(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Screen out of bounds x: ',
					_elm_lang$core$Basics$toString(_p8)));
		}
	});
var _user$project$PixelatedScreen$getFormAt = F2(
	function (screen, _p9) {
		var _p10 = _p9;
		var _p12 = _p10._1;
		var _p11 = _p10._0;
		var color = A2(
			_user$project$PixelatedScreen$getColorAt,
			{ctor: '_Tuple2', _0: _p11, _1: _p12},
			screen.buffer);
		return A4(
			_user$project$PixelatedScreen$moveTo,
			screen,
			_p11,
			_p12,
			A2(
				_evancz$elm_graphics$Collage$filled,
				color,
				_evancz$elm_graphics$Collage$square(
					_elm_lang$core$Basics$toFloat(screen.pixelSize))));
	});
var _user$project$PixelatedScreen$toHtmlForms = function (screen) {
	return A2(
		_elm_lang$core$List$map,
		_user$project$PixelatedScreen$getFormAt(screen),
		A2(
			_elm_lang$core$List$map,
			_user$project$PixelatedScreen$toCoordinates(screen),
			A2(_elm_lang$core$List$range, 0, (screen.width * screen.height) - 1)));
};
var _user$project$PixelatedScreen$setBufferColor = F3(
	function (_p13, color, buffer) {
		var _p14 = _p13;
		var _p15 = _p14._1;
		var bufferRow = A3(
			_elm_lang$core$Array$set,
			_p14._0,
			color,
			A2(_user$project$PixelatedScreen$getBufferRow, _p15, buffer));
		return A3(_elm_lang$core$Array$set, _p15, bufferRow, buffer);
	});
var _user$project$PixelatedScreen$buffer = F2(
	function (color, _p16) {
		var _p17 = _p16;
		return A2(
			_elm_lang$core$Array$initialize,
			_p17._1,
			function (_p18) {
				return A2(
					_elm_lang$core$Array$initialize,
					_p17._0,
					function (_p19) {
						return color;
					});
			});
	});
var _user$project$PixelatedScreen$screen = F3(
	function (pixelSize, _p20, color) {
		var _p21 = _p20;
		var _p23 = _p21._0;
		var _p22 = _p21._1;
		var h = pixelSize * _p22;
		var w = pixelSize * _p23;
		return {
			canvasWidth: w,
			canvasHeight: h,
			pixelSize: pixelSize,
			width: _p23,
			height: _p22,
			buffer: A2(
				_user$project$PixelatedScreen$buffer,
				color,
				{ctor: '_Tuple2', _0: _p23, _1: _p22})
		};
	});
var _user$project$PixelatedScreen$PixelatedScreen = F6(
	function (a, b, c, d, e, f) {
		return {canvasWidth: a, canvasHeight: b, pixelSize: c, height: d, width: e, buffer: f};
	});

var _user$project$Main$solverPart2 = function (model) {
	return 'Solve part 1 and read the screen!';
};
var _user$project$Main$litPoint = F3(
	function (color, point, screen) {
		return _elm_lang$core$Native_Utils.update(
			screen,
			{
				buffer: A3(_user$project$PixelatedScreen$setBufferColor, point, color, screen.buffer)
			});
	});
var _user$project$Main$litPointsWith = F2(
	function (points, model) {
		var screen = A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p0, s) {
					var _p1 = _p0;
					return A3(_user$project$Main$litPoint, _p1._1, _p1._0, s);
				}),
			model.screen,
			points);
		return _elm_lang$core$Native_Utils.update(
			model,
			{screen: screen});
	});
var _user$project$Main$parseRotate = function (string) {
	var match = A3(
		_elm_lang$core$Regex$find,
		_elm_lang$core$Regex$AtMost(1),
		_elm_lang$core$Regex$regex('rotate (column|row) (x|y)=(\\d+) by (\\d+)'),
		string);
	return function (l) {
		var _p2 = l;
		if (((((_p2.ctor === '::') && (_p2._1.ctor === '::')) && (_p2._1._1.ctor === '::')) && (_p2._1._1._1.ctor === '::')) && (_p2._1._1._1._1.ctor === '[]')) {
			return {
				ctor: '_Tuple2',
				_0: A2(
					_elm_lang$core$Result$withDefault,
					0,
					_elm_lang$core$String$toInt(
						A2(_elm_lang$core$Maybe$withDefault, '', _p2._1._1._0))),
				_1: A2(
					_elm_lang$core$Result$withDefault,
					0,
					_elm_lang$core$String$toInt(
						A2(_elm_lang$core$Maybe$withDefault, '', _p2._1._1._1._0)))
			};
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 132, column: 21},
					end: {line: 145, column: 70}
				},
				_p2)('Malformed rotate intruction');
		}
	}(
		_elm_lang$core$List$concat(
			A2(
				_elm_lang$core$List$map,
				function (_) {
					return _.submatches;
				},
				match)));
};
var _user$project$Main$problemDay = 8;
var _user$project$Main$screenOnColor = A3(_elm_lang$core$Color$rgb, 0, 153, 0);
var _user$project$Main$litPoints = F2(
	function (points, model) {
		var screen = A3(
			_elm_lang$core$List$foldl,
			_user$project$Main$litPoint(_user$project$Main$screenOnColor),
			model.screen,
			points);
		return _elm_lang$core$Native_Utils.update(
			model,
			{screen: screen});
	});
var _user$project$Main$executeInstruction = F2(
	function (instruction, model) {
		var _p4 = instruction;
		switch (_p4.ctor) {
			case 'Rect':
				var points = _elm_lang$core$List$concat(
					A2(
						_elm_lang$core$List$map,
						function (px) {
							return A2(
								_elm_lang$core$List$map,
								function (py) {
									return {ctor: '_Tuple2', _0: px, _1: py};
								},
								A2(_elm_lang$core$List$range, 0, _p4._0._1 - 1));
						},
						A2(_elm_lang$core$List$range, 0, _p4._0._0 - 1)));
				return A2(_user$project$Main$litPoints, points, model);
			case 'RColumn':
				var points = A2(
					_elm_lang$core$List$map,
					function (_p5) {
						var _p6 = _p5;
						var _p8 = _p6._1;
						var _p7 = _p6._0;
						var newColor = A2(
							_user$project$PixelatedScreen$getColorAt,
							{
								ctor: '_Tuple2',
								_0: _p7,
								_1: A2(_elm_lang$core$Basics_ops['%'], _p8 - _p4._0._1, model.screen.height)
							},
							model.screen.buffer);
						return {
							ctor: '_Tuple2',
							_0: {ctor: '_Tuple2', _0: _p7, _1: _p8},
							_1: newColor
						};
					},
					A2(
						_elm_lang$core$List$map,
						function (y) {
							return {ctor: '_Tuple2', _0: _p4._0._0, _1: y};
						},
						A2(_elm_lang$core$List$range, 0, model.screen.height - 1)));
				return A2(_user$project$Main$litPointsWith, points, model);
			default:
				var points = A2(
					_elm_lang$core$List$map,
					function (_p9) {
						var _p10 = _p9;
						var _p12 = _p10._1;
						var _p11 = _p10._0;
						var newColor = A2(
							_user$project$PixelatedScreen$getColorAt,
							{
								ctor: '_Tuple2',
								_0: A2(_elm_lang$core$Basics_ops['%'], _p11 - _p4._0._1, model.screen.width),
								_1: _p12
							},
							model.screen.buffer);
						return {
							ctor: '_Tuple2',
							_0: {ctor: '_Tuple2', _0: _p11, _1: _p12},
							_1: newColor
						};
					},
					A2(
						_elm_lang$core$List$map,
						function (x) {
							return {ctor: '_Tuple2', _0: x, _1: _p4._0._0};
						},
						A2(_elm_lang$core$List$range, 0, model.screen.width - 1)));
				return A2(_user$project$Main$litPointsWith, points, model);
		}
	});
var _user$project$Main$screenOffColor = A3(_elm_lang$core$Color$rgb, 15, 15, 35);
var _user$project$Main$init = {
	ctor: '_Tuple2',
	_0: {
		problemDay: _user$project$Main$problemDay,
		input: A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			A2(_elm_lang$core$Array$get, _user$project$Main$problemDay - 1, _user$project$Inputs$problemInputs)),
		solutionPart1: '',
		solutionPart2: '',
		screen: A3(
			_user$project$PixelatedScreen$screen,
			20,
			{ctor: '_Tuple2', _0: 50, _1: 6},
			_user$project$Main$screenOffColor)
	},
	_1: _elm_lang$core$Platform_Cmd$none
};
var _user$project$Main$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$none;
};
var _user$project$Main$Model = F5(
	function (a, b, c, d, e) {
		return {problemDay: a, input: b, solutionPart1: c, solutionPart2: d, screen: e};
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
								_0: _elm_lang$html$Html$text('Screen'),
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
										_elm_lang$html$Html$div,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: _evancz$elm_graphics$Element$toHtml(
												A3(
													_evancz$elm_graphics$Collage$collage,
													model.screen.canvasWidth,
													model.screen.canvasHeight,
													_user$project$PixelatedScreen$toHtmlForms(model.screen))),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$RColumn = function (a) {
	return {ctor: 'RColumn', _0: a};
};
var _user$project$Main$RRow = function (a) {
	return {ctor: 'RRow', _0: a};
};
var _user$project$Main$Rect = function (a) {
	return {ctor: 'Rect', _0: a};
};
var _user$project$Main$parseRect = function (string) {
	var matches = A3(
		_elm_lang$core$Regex$find,
		_elm_lang$core$Regex$AtMost(1),
		_elm_lang$core$Regex$regex('rect (\\d+)x(\\d+)'),
		string);
	return function (l) {
		var _p13 = l;
		if (((_p13.ctor === '::') && (_p13._1.ctor === '::')) && (_p13._1._1.ctor === '[]')) {
			return _user$project$Main$Rect(
				{
					ctor: '_Tuple2',
					_0: A2(
						_elm_lang$core$Result$withDefault,
						0,
						_elm_lang$core$String$toInt(_p13._0)),
					_1: A2(
						_elm_lang$core$Result$withDefault,
						0,
						_elm_lang$core$String$toInt(_p13._1._0))
				});
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'Main',
				{
					start: {line: 110, column: 21},
					end: {line: 118, column: 68}
				},
				_p13)('Malformed rect intruction');
		}
	}(
		A2(
			_elm_lang$core$List$map,
			_elm_lang$core$Maybe$withDefault(''),
			_elm_lang$core$List$concat(
				A2(
					_elm_lang$core$List$map,
					function (_) {
						return _.submatches;
					},
					matches))));
};
var _user$project$Main$parseInstruction = function (string) {
	return A2(_elm_lang$core$String$contains, 'rect', string) ? _user$project$Main$parseRect(string) : (A2(_elm_lang$core$String$contains, 'row', string) ? _user$project$Main$RRow(
		_user$project$Main$parseRotate(string)) : (A2(_elm_lang$core$String$contains, 'column', string) ? _user$project$Main$RColumn(
		_user$project$Main$parseRotate(string)) : _elm_lang$core$Native_Utils.crash(
		'Main',
		{
			start: {line: 158, column: 9},
			end: {line: 158, column: 20}
		})('Unexpected input')));
};
var _user$project$Main$solverPart1 = function (model) {
	var instructions = A2(
		_elm_lang$core$List$map,
		_user$project$Main$parseInstruction,
		A2(
			_elm_lang$core$List$map,
			_elm_lang$core$String$trim,
			A2(_elm_lang$core$String$split, '\n', model.input)));
	return A3(_elm_lang$core$List$foldl, _user$project$Main$executeInstruction, model, instructions);
};
var _user$project$Main$update = F2(
	function (msg, model) {
		var _p15 = msg;
		if (_p15.ctor === 'Solve') {
			var newModel = _user$project$Main$solverPart1(model);
			var solution = _elm_lang$core$Basics$toString(
				_elm_lang$core$List$length(
					A2(
						_elm_lang$core$List$filter,
						function (c) {
							return _elm_lang$core$Native_Utils.eq(c, _user$project$Main$screenOnColor);
						},
						_elm_lang$core$List$concat(
							_elm_lang$core$Array$toList(
								A2(_elm_lang$core$Array$map, _elm_lang$core$Array$toList, newModel.screen.buffer))))));
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					newModel,
					{solutionPart1: solution}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			var solution = _user$project$Main$solverPart2(model);
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{solutionPart2: solution}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
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


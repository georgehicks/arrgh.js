var testIterators = function () {
	"use strict";

	var test = function (enumerable, getEmptyEnumerable) {
		if (getEmptyEnumerable) {
			it("current should return undefined when it's empty", function () {
				var iterator = getEmptyEnumerable(arrgh.Enumerable.empty()).getIterator();
				expect(iterator.current()).toBe(undefined);
			});

			it("moveNext should return false when it's empty", function () {
				var iterator = getEmptyEnumerable(arrgh.Enumerable.empty()).getIterator();
				expect(iterator.moveNext()).toBe(false);
			});
		}

		it("current should return undefined when not moved", function () {
			var iterator = enumerable.getIterator();
			expect(iterator.current()).toBe(undefined);
		});

		it("should not return undefined when moveNext is true", function () {
			var iterator = enumerable.getIterator();
			var i = 0;
			for (i; i < 1000; i += 1) {
				var moved = iterator.moveNext();
				if (moved) {
					var current = iterator.current();
					expect(current).not.toBe(undefined);
					if (current === undefined) {
						break;
					}
				}
			}
		});

		it("should return undefined when moveNext is false", function () {
			var iterator = enumerable.getIterator();
			var i = 0;
			for (i; i < 1000; i += 1) {
				var moved = iterator.moveNext();
				if (!moved) {
					var current = iterator.current();
					expect(current).toBe(undefined);
					if (current !== undefined) {
						break;
					}
				}
			}
		});
	};

	var testList = function (list) {
		it("should throw if an item is added after getting the iterator, but before actual enumeration", function () {
			var iterator = list.getIterator();
			list.add(6);
			expect(function () {
				iterator.moveNext();
			}).toThrow();
		});

		it("should throw if an item is added during enumeration", function () {
			var iterator = list.getIterator();
			iterator.moveNext();
			list.remove(6);
			expect(function () {
				iterator.moveNext();
			}).toThrow();
		});
	};

	describe("Iterators", function () {
		describe("- ArrayIterator", function () {
			describe("for an Enumerable", function () {
				test(new arrgh.Enumerable(1, 2, 3, 4, 5), function (e) {
					return e;
				});
			});

			describe("for a List", function () {
				var list = new arrgh.List(1, 2, 3, 4, 5);
				test(list, function (e) {
					return new arrgh.List();
				});
				testList(list);
			});
		});

		describe("- DictionaryIterator", function () {
			var d = new arrgh.Dictionary();
			d.add(1, 1);
			d.add(2, 2);
			d.add(3, 3);
			d.add(4, 4);
			d.add(5, 5);
			test(d, function () {
				return new arrgh.Dictionary();
			});
			testList(d);
		});

		describe("- WhereIterator", function () {
			test(new arrgh.Enumerable(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).where(function (n) {
				return n % 2 == 1;
			}), function (e) {
				return e.where(function () {
					return false;
				});
			});
		});

		describe("- SelectIterator", function () {
			test(new arrgh.Enumerable(1, 2, 3, 4, 5).select(function (n) {
				return n;
			}), function (e) {
				return e.select(function () {
					return {};
				});
			});

			it("should call the selector once, even when the single element is undefined", function () {
				expect(new arrgh.Enumerable([undefined]).select(function () {
					return true;
				}).toArray()).toEqual([true]);
			});
		});

		describe("- DefaultIfEmptyIterator", function () {
			// DefaultIfEmpty is a little weird because it can never be empty.
			var enumerable = new arrgh.Enumerable(1, 2, 3, 4, 5);
			test(enumerable.defaultIfEmpty());

			var empty = arrgh.Enumerable.empty().defaultIfEmpty();
			it("moveNext should return true once, even when empty", function () {
				var iterator = empty.getIterator();
				expect(iterator.moveNext()).toBe(true);
				expect(iterator.moveNext()).toBe(false);
			});
		});

		describe("- OrderedIterator", function () {
			test(new arrgh.Enumerable(3, 2, 4, 5, 1).orderBy(function (elem) {
				return elem;
			}), function (e) {
				return e.orderBy(function (elem) {
					return elem;
				});
			});
		});

		describe("- UnionIterator", function () {
			test(new arrgh.Enumerable(1, 2, 3).union(new arrgh.Enumerable(1, 2)), function (e) {
				return e.union(arrgh.Enumerable.empty());
			});
		});

		describe("- ExceptIterator", function () {
			test(new arrgh.Enumerable(1, 2, 3, 4, 4, 5, 6, 7).except(new arrgh.Enumerable(6, 7)), function (e) {
				return e.except(arrgh.Enumerable.empty());
			});
		});

		describe("- GroupByIterator", function () {
			test(new arrgh.Enumerable(people).groupBy(function (p) {
				return p.first;
			}), function (e) {
				return e.groupBy(function (p) {
					return p.first;
				});
			});
		});

		describe("- GroupJoinIterator", function () {
			var firstSelector = function (p) {
				return p.first;
			};
			test(new arrgh.Enumerable(people).groupJoin(new arrgh.Enumerable(people), firstSelector, firstSelector, function (p, ppl) {
				return { p: p, ppl: ppl };
			}), function (e) {
				return e.groupJoin(arrgh.Enumerable.empty(), firstSelector, firstSelector);
			});

			it("should loop once even when there is only a single undefined", function () {
				var looped = false;
				var r = new arrgh.Enumerable([undefined]).groupJoin(new arrgh.Enumerable(["bla"]), function () {
					looped = true;
					return true;
				}, function () {
					return true;
				}, function (key, group) {
					return { key: key, group: group };
				}).toArray();
				expect(looped).toBe(true);
			});
		});

		describe("- IntersectIterator", function () {
			test(new arrgh.Enumerable(1, 2, 3, 4, 4, 5, 6, 7).intersect(new arrgh.Enumerable(1, 2, 6, 7)), function (e) {
				return e.except(arrgh.Enumerable.empty());
			});
		});

		describe("- JoinIterator", function () {
			var firstSelector = function (p) {
				return p.first;
			};
			test(new arrgh.Enumerable(people).join(new arrgh.Enumerable(people), firstSelector, firstSelector, function (p1, p2) {
				return { p1: p1, p2: p2 };
			}), function (e) {
				return e.join(new arrgh.Enumerable(people), firstSelector, firstSelector);
			});
		});

		describe("- RangeIterator", function () {
			test(arrgh.Enumerable.range(0, 10), function (e) {
				return arrgh.Enumerable.range(0, 0);
			});
		});
	});
};
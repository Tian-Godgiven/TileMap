import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Tile } from '../types';

export interface ObjectTemplate {
  type: string;
  objectType: 'tile' | 'composite';
  data: Partial<Tile>; // 磁贴模板数据
}

export interface ObjectCollection {
  name: string;
  fileName: string;
  collectionType: 'default' | 'customize' | 'quickUse';
  objects: ObjectTemplate[];
}

export const useObjectLibStore = defineStore('objectLib', () => {
  const collections = ref<Map<string, ObjectCollection>>(new Map());

  function addCollection(collection: ObjectCollection): void {
    const key = `${collection.collectionType}_${collection.fileName}`;
    collections.value.set(key, collection);
  }

  function removeCollection(collectionType: string, fileName: string): void {
    const key = `${collectionType}_${fileName}`;
    collections.value.delete(key);
  }

  function updateCollection(
    collectionType: string,
    fileName: string,
    updates: Partial<ObjectCollection>
  ): void {
    const key = `${collectionType}_${fileName}`;
    const collection = collections.value.get(key);
    if (collection) {
      Object.assign(collection, updates);
    }
  }

  function addObjectToCollection(
    collectionType: string,
    fileName: string,
    object: ObjectTemplate
  ): void {
    const key = `${collectionType}_${fileName}`;
    const collection = collections.value.get(key);
    if (collection) {
      collection.objects.push(object);
    }
  }

  function clearCollection(collectionType: string, fileName: string): void {
    const key = `${collectionType}_${fileName}`;
    const collection = collections.value.get(key);
    if (collection) {
      collection.objects = [];
    }
  }

  async function loadCollectionsFromDirectory(
    _collectionType: 'default' | 'customize' | 'quickUse'
  ): Promise<void> {
    // 从本地加载对象库文件
    // 这里需要实现文件系统访问
    // 暂时留空，后续实现
  }

  async function saveCollection(_collection: ObjectCollection): Promise<boolean> {
    // 保存对象库到文件
    // 暂时留空，后续实现
    return true;
  }

  return {
    collections,
    addCollection,
    removeCollection,
    updateCollection,
    addObjectToCollection,
    clearCollection,
    loadCollectionsFromDirectory,
    saveCollection
  };
});

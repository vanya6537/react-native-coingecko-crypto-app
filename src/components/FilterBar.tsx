import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ListFilters } from '../types/index';

interface FilterBarProps {
  filters: ListFilters;
  onFilterChange: (filters: Partial<ListFilters>) => void;
  isSorted?: boolean;
  onSortToggle?: () => void;
}

type SortOption = 'price' | 'change24h' | 'market_cap';

const DEBOUNCE_DELAY = 300; // 300ms debounce

export const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange,
  isSorted = false,
  onSortToggle,
}) => {
  const { t } = useTranslation();
  const [sortPickerVisible, setSortPickerVisible] = useState(false);
  const [localSearchText, setLocalSearchText] = useState(filters.search);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: t('tokensList.price'), value: 'price' },
    { label: t('tokensList.change24h'), value: 'change24h' },
    { label: t('tokensList.marketCap'), value: 'market_cap' },
  ];

  // Debounced search handler
  const handleSearchChange = useCallback((text: string) => {
    setLocalSearchText(text);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(() => {
      onFilterChange({ search: text });
    }, DEBOUNCE_DELAY);
  }, [onFilterChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Sync local search text when filters.search changes externally
  useEffect(() => {
    setLocalSearchText(filters.search);
  }, [filters.search]);

  const handleSortChange = useCallback((sortBy: SortOption) => {
    setSortPickerVisible(false);
    onFilterChange({ sortBy });
    // Auto-enable sorting when changing sort option
    if (!isSorted && onSortToggle) {
      onSortToggle();
    }
  }, [onFilterChange, isSorted, onSortToggle]);

  const handleToggleSortOrder = useCallback(() => {
    const newOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFilterChange({ sortOrder: newOrder });
  }, [filters.sortOrder, onFilterChange]);

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label || 'Sort';
  const sortOrderSymbol = filters.sortOrder === 'asc' ? '↑' : '↓';

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('tokensList.search')}
          placeholderTextColor="#999"
          value={localSearchText}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Filter/Sort Controls */}
      <View style={styles.controlsRow}>
        {/* Sort Mode Toggle */}
        <TouchableOpacity
          style={[
            styles.sortModeButton,
            isSorted && styles.sortModeButtonActive,
          ]}
          onPress={onSortToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.sortModeText}>
            {isSorted ? t('tokensList.sortMode') : t('tokensList.searchMode')}
          </Text>
        </TouchableOpacity>

        {/* Sort Picker Button (only available when sorted) */}
        <TouchableOpacity
          style={[
            styles.sortButton,
            !isSorted && styles.sortButtonDisabled,
          ]}
          onPress={() => setSortPickerVisible(true)}
          activeOpacity={0.7}
          disabled={!isSorted}
        >
          <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
          <Text style={styles.sortButtonIcon}>⚙</Text>
        </TouchableOpacity>

        {/* Sort Order Toggle (only available when sorted) */}
        <TouchableOpacity
          style={[
            styles.sortOrderButton,
            !isSorted && styles.sortOrderButtonDisabled,
          ]}
          onPress={handleToggleSortOrder}
          activeOpacity={0.7}
          disabled={!isSorted}
        >
          <Text style={styles.sortOrderSymbol}>{sortOrderSymbol}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Picker Modal */}
      <Modal
        transparent={true}
        visible={sortPickerVisible}
        onRequestClose={() => setSortPickerVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('tokensList.sortByTitle')}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    filters.sortBy === option.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSortChange(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      filters.sortBy === option.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filters.sortBy === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Modal Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSortPickerVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sortModeButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortModeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sortButtonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  sortOrderButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortOrderButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  sortOrderSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  modalOption: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  modalOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: '#1976D2',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modalCloseButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

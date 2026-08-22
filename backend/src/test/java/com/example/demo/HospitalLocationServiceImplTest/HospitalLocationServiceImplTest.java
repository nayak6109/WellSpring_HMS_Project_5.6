package com.example.demo.HospitalLocationServiceImplTest;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.HospitalLocationDTO;
import com.example.demo.entities.HospitalLocation;
import com.example.demo.repository.HospitalLocationRepository;
import com.example.demo.services.HospitalLocationServiceImpl;

@ExtendWith(MockitoExtension.class)
class HospitalLocationServiceImplTest {

    @Mock
    private HospitalLocationRepository repository;

    @InjectMocks
    private HospitalLocationServiceImpl service;

    private HospitalLocation sampleEntity;
    private HospitalLocationDTO sampleDto;

    @BeforeEach
    void setUp() {
        sampleEntity = new HospitalLocation();
        sampleEntity.setLat(28.6139);
        sampleEntity.setLng(77.2090);

        sampleDto = new HospitalLocationDTO(28.6139, 77.2090);
    }

    // --- getLocation() Tests ---

    @Test
    @DisplayName("getLocation - jab data available ho to DTO return hona chahiye")
    void getLocation_WhenLocationExists_ReturnsDTO() {
        when(repository.findAll()).thenReturn(List.of(sampleEntity));

        HospitalLocationDTO result = service.getLocation();

        assertNotNull(result);
        assertEquals(sampleEntity.getLat(), result.getLat());
        assertEquals(sampleEntity.getLng(), result.getLng());
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("getLocation - jab database khali ho to null return hona chahiye")
    void getLocation_WhenNoLocationExists_ReturnsNull() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        HospitalLocationDTO result = service.getLocation();

        assertNull(result);
        verify(repository, times(1)).findAll();
    }

    // --- saveOrUpdateLocation() Tests ---

    @Test
    @DisplayName("saveOrUpdateLocation - jab DB khali ho to new location create honi chahiye")
    void saveOrUpdateLocation_WhenNoLocationExists_CreatesNew() {
        when(repository.findAll()).thenReturn(Collections.emptyList());
        when(repository.save(any(HospitalLocation.class))).thenReturn(sampleEntity);

        HospitalLocationDTO result = service.saveOrUpdateLocation(sampleDto);

        assertNotNull(result);
        assertEquals(sampleDto.getLat(), result.getLat());
        assertEquals(sampleDto.getLng(), result.getLng());
        
        verify(repository, times(1)).findAll();
        verify(repository, times(1)).save(any(HospitalLocation.class));
    }

    @Test
    @DisplayName("saveOrUpdateLocation - jab Location pehle se ho to existing record update hona chahiye")
    void saveOrUpdateLocation_WhenLocationExists_UpdatesExisting() {
        HospitalLocation existingLocation = new HospitalLocation();
        existingLocation.setLat(10.0000);
        existingLocation.setLng(20.0000);

        when(repository.findAll()).thenReturn(List.of(existingLocation));
        when(repository.save(any(HospitalLocation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HospitalLocationDTO updateDto = new HospitalLocationDTO(12.9716, 77.5946);

        HospitalLocationDTO result = service.saveOrUpdateLocation(updateDto);

        assertNotNull(result);
        assertEquals(12.9716, result.getLat());
        assertEquals(77.5946, result.getLng());

        verify(repository, times(1)).findAll();
        verify(repository, times(1)).save(existingLocation);
    }
}